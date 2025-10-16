// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FreelanceEscrow
 * @notice Two-party escrow for BNB where buyer funds, vendor delivers an IPFS CID,
 *         buyer approves *that same CID*, then vendor withdraws. An optional arbiter
 *         can resolve disputes either way. Contract *emits* the CID and pins off-chain.
 *
 * Workflow:
 * 1) Buyer deploys (or factory deploys) with vendor + deadline (unix).
 * 2) Buyer funds with native BNB -> state = Funded.
 * 3) Vendor deliver(cid[, contentHash]) -> stores 'proposedCID' & vendorApproved.
 * 4) Buyer approve(cid) must match proposedCID -> buyerApproved.
 * 5) When both approved -> state becomes Releasable, vendor can withdraw().
 * 6) Contract emits ResultFinalized(cid, contentHash). Off-chain service pins CID.
 * 7) If deadline passes without approval -> buyer can refundAfterDeadline().
 * 8) Either party may dispute -> arbiter (owner) resolves to buyer or vendor.
 */
contract Escrow is Ownable, ReentrancyGuard {
    enum State { Unfunded, Funded, Delivered, Disputed, Releasable, Paid, Refunded }
    State public state;

    address public immutable buyer;
    address public immutable vendor;
    address public immutable arbiter; // optional (can be address(0))

    uint256 public amount;       // escrowed native BNB
    uint64  public immutable deadline; // unix seconds

    // Result metadata
    string  public cid;              // finalized CID (CIDv1 string recommended)
    bytes32 public contentHash;      // optional keccak256/file hash for integrity
    string  public proposedCID;      // vendor-proposed CID (pending buyer approval)
    bytes32 public proposedContentHash;

    bool public buyerApproved;
    bool public vendorApproved;

    event Funded(address indexed buyer, uint256 amount);
    event Delivered(address indexed vendor, string cid, bytes32 contentHash);
    event Approved(address indexed buyer, string cid);
    event Disputed(address indexed by);
    event ResultFinalized(string cid, bytes32 contentHash); // pin this off-chain
    event Refunded(address indexed to, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event ResolvedToBuyer(address indexed arbiter, uint256 amount);
    event ResolvedToVendor(address indexed arbiter, uint256 amount);

    error OnlyBuyer();
    error OnlyVendor();
    error OnlyParticipant();
    error BadState();
    error BadValue();
    error DeadlineNotReached();
    error CIDMismatch();
    error NoArbiter();

    modifier onlyBuyer() {
        if (msg.sender != buyer) revert OnlyBuyer();
        _;
    }

    modifier onlyVendor() {
        if (msg.sender != vendor) revert OnlyVendor();
        _;
    }

    modifier onlyParticipant() {
        if (msg.sender != buyer && msg.sender != vendor) revert OnlyParticipant();
        _;
    }

    constructor(
        address _buyer,
        address _vendor,
        address _arbiter, // set 0x0 to disable arbitration
        uint64 _deadline
    ) Ownable(_arbiter != address(0) ? _arbiter : msg.sender) {
        require(_buyer != address(0) && _vendor != address(0), "zero addr");
        buyer = _buyer;
        vendor = _vendor;
        arbiter = _arbiter;
        deadline = _deadline;
        state = State.Unfunded;
    }

    /// @notice Buyer funds the escrow with native BNB.
    function fund() external payable onlyBuyer {
        if (state != State.Unfunded) revert BadState();
        if (msg.value == 0) revert BadValue();
        amount = msg.value;
        state = State.Funded;
        emit Funded(buyer, msg.value);
    }

    /// @notice Vendor delivers by proposing a CID (and optional integrity hash).
    /// @dev Sets vendorApproved = true. Moves state to Delivered.
    function deliver(string calldata _cid, bytes32 _contentHash) external onlyVendor {
        if (state != State.Funded && state != State.Delivered) revert BadState();
        require(bytes(_cid).length > 0, "empty CID");

        proposedCID = _cid;
        proposedContentHash = _contentHash;
        vendorApproved = true;

        if (state == State.Funded) {
            state = State.Delivered;
        }

        emit Delivered(vendor, _cid, _contentHash);
    }

    /// @notice Buyer approves *the exact CID* proposed by vendor.
    /// @dev Sets buyerApproved. If both approved, transitions to Releasable.
    function approve(string calldata _cid) external onlyBuyer {
        if (state != State.Delivered) revert BadState();
        if (keccak256(bytes(_cid)) != keccak256(bytes(proposedCID))) revert CIDMismatch();

        buyerApproved = true;
        emit Approved(buyer, _cid);

        // both approved -> finalize CID and allow vendor withdraw
        if (vendorApproved && buyerApproved) {
            cid = proposedCID;
            contentHash = proposedContentHash;
            state = State.Releasable;
            emit ResultFinalized(cid, contentHash);
        }
    }

    /// @notice Either party can open a dispute any time after funding and before payout/refund.
    function dispute() external onlyParticipant {
        if (state != State.Funded && state != State.Delivered) revert BadState();
        state = State.Disputed;
        emit Disputed(msg.sender);
    }

    /// @notice Arbiter resolves to vendor -> immediate payout.
    function resolveToVendor() external onlyOwner nonReentrant {
        if (arbiter == address(0)) revert NoArbiter();
        if (state != State.Disputed) revert BadState();

        // if vendor had delivered a CID already, finalize it
        if (bytes(proposedCID).length > 0) {
            cid = proposedCID;
            contentHash = proposedContentHash;
            emit ResultFinalized(cid, contentHash);
        }

        uint256 val = amount;
        amount = 0;
        state = State.Paid;

        (bool ok, ) = payable(vendor).call{value: val}("");
        require(ok, "payout failed");

        emit ResolvedToVendor(msg.sender, val);
        emit Withdrawn(vendor, val);
    }

    /// @notice Arbiter resolves to buyer -> refund.
    function resolveToBuyer() external onlyOwner nonReentrant {
        if (arbiter == address(0)) revert NoArbiter();
        if (state != State.Disputed) revert BadState();

        uint256 val = amount;
        amount = 0;
        state = State.Refunded;

        (bool ok, ) = payable(buyer).call{value: val}("");
        require(ok, "refund failed");

        emit ResolvedToBuyer(msg.sender, val);
        emit Refunded(buyer, val);
    }

    /// @notice After both parties approved, vendor pulls the payment (safer than push).
    function withdraw() external onlyVendor nonReentrant {
        if (state != State.Releasable) revert BadState();

        uint256 val = amount;
        amount = 0;
        state = State.Paid;

        (bool ok, ) = payable(vendor).call{value: val}("");
        require(ok, "withdraw failed");

        emit Withdrawn(vendor, val);
    }

    /// @notice If not approved by deadline, buyer can get a refund.
    function refundAfterDeadline() external onlyBuyer nonReentrant {
        if (state != State.Funded && state != State.Delivered) revert BadState();
        if (block.timestamp < deadline) revert DeadlineNotReached();

        uint256 val = amount;
        amount = 0;
        state = State.Refunded;

        (bool ok, ) = payable(buyer).call{value: val}("");
        require(ok, "refund failed");

        emit Refunded(buyer, val);
    }

    // ------- View helpers -------

    function isReleasable() external view returns (bool) {
        return state == State.Releasable && amount > 0;
    }

    function participants() external view returns (address, address, address) {
        return (buyer, vendor, arbiter);
    }
}
