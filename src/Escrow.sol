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

    struct EscrowInfo {
        address buyer;
        address vendor;
        address arbiter;
        uint256 amount;
        uint64 deadline;
        string cid;
        bytes32 contentHash;
        string proposedCID;
        bytes32 proposedContentHash;
        bool buyerApproved;
        bool vendorApproved;
        State state;
    }

    EscrowInfo public escrowInfo;

    event Funded(address indexed buyer, uint256 amount);
    event Cancelled(address indexed buyer, uint256 amount);
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
        if (msg.sender != escrowInfo.buyer) revert OnlyBuyer();
        _;
    }

    modifier onlyVendor() {
        if (msg.sender != escrowInfo.vendor) revert OnlyVendor();
        _;
    }

    modifier onlyParticipant() {
        if (msg.sender != escrowInfo.buyer && msg.sender != escrowInfo.vendor) revert OnlyParticipant();
        _;
    }

    constructor(
        address _buyer,
        address _vendor,
        address _arbiter, // set 0x0 to disable arbitration
        uint64 _deadline
    ) Ownable(_arbiter != address(0) ? _arbiter : msg.sender) {
        require(_buyer != address(0) && _vendor != address(0), "zero addr");
        escrowInfo.buyer = _buyer;
        escrowInfo.vendor = _vendor;
        escrowInfo.arbiter = _arbiter;
        escrowInfo.deadline = _deadline;
        escrowInfo.state = State.Unfunded;
    }

    /// @notice Buyer funds the escrow with native BNB.
    function fund() external payable onlyBuyer {
        if (escrowInfo.state != State.Unfunded) revert BadState();
        if (msg.value == 0) revert BadValue();
        escrowInfo.amount = msg.value;
        escrowInfo.state = State.Funded;
        emit Funded(escrowInfo.buyer, msg.value);
    }

    /// @notice Buyer can cancel and get immediate refund if vendor hasn't delivered yet.
    /// @dev Only works in Funded state. Once vendor delivers, must use dispute system.
    function cancel() external onlyBuyer nonReentrant {
        if (escrowInfo.state != State.Funded) revert BadState();
        
        uint256 val = escrowInfo.amount;
        escrowInfo.amount = 0;
        escrowInfo.state = State.Refunded;
        
        (bool ok, ) = payable(escrowInfo.buyer).call{value: val}("");
        require(ok, "refund failed");
        
        emit Cancelled(escrowInfo.buyer, val);
        emit Refunded(escrowInfo.buyer, val);
    }

    /// @notice Vendor delivers by proposing a CID (and optional integrity hash).
    /// @dev Sets vendorApproved = true. Moves state to Delivered.
    function deliver(string calldata _cid, bytes32 _contentHash) external onlyVendor {
        if (escrowInfo.state != State.Funded && escrowInfo.state != State.Delivered) revert BadState();
        require(bytes(_cid).length > 0, "empty CID");

        escrowInfo.proposedCID = _cid;
        escrowInfo.proposedContentHash = _contentHash;
        escrowInfo.vendorApproved = true;

        if (escrowInfo.state == State.Funded) {
            escrowInfo.state = State.Delivered;
        }

        emit Delivered(escrowInfo.vendor, _cid, _contentHash);
    }

    /// @notice Buyer approves *the exact CID* proposed by vendor.
    /// @dev Sets buyerApproved. If both approved, transitions to Releasable.
    function approve(string calldata _cid) external onlyBuyer {
        if (escrowInfo.state != State.Delivered) revert BadState();
        if (keccak256(bytes(_cid)) != keccak256(bytes(escrowInfo.proposedCID))) revert CIDMismatch();

        escrowInfo.buyerApproved = true;
        emit Approved(escrowInfo.buyer, _cid);

        // both approved -> finalize CID and allow vendor withdraw
        if (escrowInfo.vendorApproved && escrowInfo.buyerApproved) {
            escrowInfo.state = State.Releasable;
            emit ResultFinalized(escrowInfo.proposedCID, escrowInfo.proposedContentHash);
        }
    }

    /// @notice Either party can open a dispute any time after funding and before payout/refund.
    function dispute() external onlyParticipant {
        if (escrowInfo.state != State.Funded && escrowInfo.state != State.Delivered) revert BadState();
        escrowInfo.state = State.Disputed;
        emit Disputed(msg.sender);
    }

    /// @notice Arbiter resolves to vendor -> immediate payout.
    function resolveToVendor() external onlyOwner nonReentrant {
        if (escrowInfo.arbiter == address(0)) revert NoArbiter();
        if (escrowInfo.state != State.Disputed) revert BadState();

        // if vendor had delivered a CID already, finalize it
        if (bytes(escrowInfo.proposedCID).length > 0) {
            escrowInfo.state = State.Releasable;
            emit ResultFinalized(escrowInfo.proposedCID, escrowInfo.proposedContentHash);
        }

        uint256 val = escrowInfo.amount;
        escrowInfo.amount = 0;
        escrowInfo.state = State.Paid;

        (bool ok, ) = payable(escrowInfo.vendor).call{value: val}("");
        require(ok, "payout failed");

        emit ResolvedToVendor(msg.sender, val);
        emit Withdrawn(escrowInfo.vendor, val);
    }

    /// @notice Arbiter resolves to buyer -> refund.
    function resolveToBuyer() external onlyOwner nonReentrant {
        if (escrowInfo.arbiter == address(0)) revert NoArbiter();
        if (escrowInfo.state != State.Disputed) revert BadState();

        uint256 val = escrowInfo.amount;
        escrowInfo.amount = 0;
        escrowInfo.state = State.Refunded;

        (bool ok, ) = payable(escrowInfo.buyer).call{value: val}("");
        require(ok, "refund failed");

        emit ResolvedToBuyer(msg.sender, val);
        emit Refunded(escrowInfo.buyer, val);
    }

    /// @notice After both parties approved, vendor pulls the payment (safer than push).
    function withdraw() external onlyVendor nonReentrant {
        if (escrowInfo.state != State.Releasable) revert BadState();

        uint256 val = escrowInfo.amount;
        escrowInfo.amount = 0;
        escrowInfo.state = State.Paid;

        (bool ok, ) = payable(escrowInfo.vendor).call{value: val}("");
        require(ok, "withdraw failed");

        emit Withdrawn(escrowInfo.vendor, val);
    }

    /// @notice If not approved by deadline, buyer can get a refund.
    function refundAfterDeadline() external onlyBuyer nonReentrant {
        if (escrowInfo.state != State.Funded && escrowInfo.state != State.Delivered) revert BadState();
        if (block.timestamp < escrowInfo.deadline) revert DeadlineNotReached();

        uint256 val = escrowInfo.amount;
        escrowInfo.amount = 0;
        escrowInfo.state = State.Refunded;

        (bool ok, ) = payable(escrowInfo.buyer).call{value: val}("");
        require(ok, "refund failed");

        emit Refunded(escrowInfo.buyer, val);
    }

    // ------- View helpers -------

    function isReleasable() external view returns (bool) {
        return escrowInfo.state == State.Releasable && escrowInfo.amount > 0;
    }

    function participants() external view returns (address, address, address) {
        return (escrowInfo.buyer, escrowInfo.vendor, escrowInfo.arbiter);
    }

    function getState() external view returns (uint256) {
        return uint256(escrowInfo.state);
    }

    function getAllInfo() external view returns (EscrowInfo memory) {
        return escrowInfo;
    }
}
