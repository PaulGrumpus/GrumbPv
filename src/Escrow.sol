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
 * 2) Buyer funds with native BNB + 0.5% fee -> state = Funded.
 * 3) Vendor deliver(cid[, contentHash]) -> stores 'proposedCID' & vendorApproved.
 * 4) Buyer approve(cid) must match proposedCID -> buyerApproved.
 * 5) When both approved -> state becomes Releasable, vendor can withdraw().
 * 6) Contract emits ResultFinalized(cid, contentHash). Off-chain service pins CID.
 * 7) If deadline passes without approval -> buyer can refundAfterDeadline().
 * 8) Either party may initiate dispute (pay fee immediately) -> other party has 48-72h to pay.
 *
 * Fee Structure:
 * - Normal completion: 1% total (0.5% buyer + 0.5% vendor) -> feeRecipient
 * - Dispute (both paid): Winner gets fee refunded, loser's fee split (arbiter 50%, feeRecipient 50%)
 * - Dispute (counterparty doesn't pay): Initiator wins by default, gets full fee refund
 * - Cancel/deadline refund: No fees (100% returned to buyer)
 */
contract Escrow is Ownable, ReentrancyGuard {
    enum State { Unfunded, Funded, Delivered, Disputed, Releasable, Paid, Refunded }

    struct EscrowInfo {
        address buyer;
        address vendor;
        address arbiter;
        address feeRecipient;
        uint256 amount;
        uint256 buyerFeeReserve;  // 0.5% buyer fee reserved for potential dispute
        uint256 disputeFeeAmount; // Fee amount each party must pay for dispute
        uint64 deadline;
        uint64 disputeFeeDeadline;
        address disputeInitiator;
        bool buyerPaidDisputeFee;
        bool vendorPaidDisputeFee;
        string cid;
        bytes32 contentHash;
        string proposedCID;
        bytes32 proposedContentHash;
        bool buyerApproved;
        bool vendorApproved;
        State state;
    }

    EscrowInfo public escrowInfo;

    event Funded(address indexed buyer, uint256 amount, uint256 buyerFee);
    event Cancelled(address indexed buyer, uint256 amount);
    event Delivered(address indexed vendor, string cid, bytes32 contentHash);
    event Approved(address indexed buyer, string cid);
    event DisputeInitiated(address indexed initiator, uint256 feeAmount, uint64 deadline);
    event DisputeFeePaid(address indexed payer, uint256 amount);
    event DisputeResolvedByDefault(address indexed winner, string reason);
    event ResultFinalized(string cid, bytes32 contentHash); // pin this off-chain
    event Refunded(address indexed to, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event ResolvedToBuyer(address indexed arbiter, uint256 amount);
    event ResolvedToVendor(address indexed arbiter, uint256 amount);
    event FeePaid(address indexed to, uint256 amount, string reason);

    error OnlyBuyer();
    error OnlyVendor();
    error OnlyParticipant();
    error BadState();
    error BadValue();
    error DeadlineNotReached();
    error CIDMismatch();
    error NoArbiter();
    error InsufficientDisputeFee();
    error DisputeFeeAlreadyPaid();
    error DisputeFeeDeadlineNotPassed();
    error BothPartiesNotPaid();

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
        address _feeRecipient,
        uint64 _deadline
    ) Ownable(_arbiter != address(0) ? _arbiter : msg.sender) {
        require(_buyer != address(0) && _vendor != address(0), "zero addr");
        require(_feeRecipient != address(0), "zero fee recipient");
        escrowInfo.buyer = _buyer;
        escrowInfo.vendor = _vendor;
        escrowInfo.arbiter = _arbiter;
        escrowInfo.feeRecipient = _feeRecipient;
        escrowInfo.deadline = _deadline;
        escrowInfo.state = State.Unfunded;
    }

    /// @notice Buyer funds the escrow with native BNB.
    /// @dev Buyer must include 0.5% extra as their fee (reserved for potential dispute).
    ///      If buyer sends X, project amount = X / 1.005, buyer fee = X - projectAmount
    function fund() external payable onlyBuyer {
        if (escrowInfo.state != State.Unfunded) revert BadState();
        if (msg.value == 0) revert BadValue();
        
        // Calculate actual project amount: X / 1.005 = X * 10000 / 10050
        uint256 projectAmount = (msg.value * 10000) / 10050;
        uint256 buyerFee = msg.value - projectAmount; // Remainder is the fee
        
        escrowInfo.amount = projectAmount;
        escrowInfo.buyerFeeReserve = buyerFee;
        
        // Set dispute fee amount (0.5% of project amount for each party)
        escrowInfo.disputeFeeAmount = (projectAmount * 50) / 10000;
        
        escrowInfo.state = State.Funded;
        emit Funded(escrowInfo.buyer, projectAmount, buyerFee);
    }

    /// @notice Buyer can cancel and get immediate refund if vendor hasn't delivered yet.
    /// @dev Only works in Funded state. Once vendor delivers, must use dispute system.
    function cancel() external onlyBuyer nonReentrant {
        if (escrowInfo.state != State.Funded) revert BadState();
        
        uint256 projectAmount = escrowInfo.amount;
        uint256 buyerFee = escrowInfo.buyerFeeReserve;
        uint256 totalRefund = projectAmount + buyerFee;
        
        escrowInfo.amount = 0;
        escrowInfo.buyerFeeReserve = 0;
        escrowInfo.state = State.Refunded;
        
        (bool ok, ) = payable(escrowInfo.buyer).call{value: totalRefund}("");
        require(ok, "refund failed");
        
        emit Cancelled(escrowInfo.buyer, totalRefund);
        emit Refunded(escrowInfo.buyer, totalRefund);
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

    /// @notice Either party can initiate a dispute by paying the dispute fee immediately.
    /// @dev Buyer uses their reserved fee. Vendor must send payment. Sets deadline for counterparty.
    function initiateDispute() external payable onlyParticipant {
        if (escrowInfo.state != State.Funded && escrowInfo.state != State.Delivered) revert BadState();
        if (escrowInfo.arbiter == address(0)) revert NoArbiter();
        
        // Determine dispute fee deadline based on who initiates
        uint64 feeDeadline;
        if (msg.sender == escrowInfo.vendor) {
            // Vendor initiates: buyer gets longer time (72 hours) to protect buyer
            feeDeadline = uint64(block.timestamp + 72 hours);
        } else {
            // Buyer initiates: vendor gets standard time (48 hours)
            feeDeadline = uint64(block.timestamp + 48 hours);
        }
        
        // Handle initiator's payment
        if (msg.sender == escrowInfo.buyer) {
            // Buyer uses their reserved fee
            if (escrowInfo.buyerFeeReserve < escrowInfo.disputeFeeAmount) revert InsufficientDisputeFee();
            escrowInfo.buyerPaidDisputeFee = true;
        } else {
            // Vendor must pay now
            if (msg.value < escrowInfo.disputeFeeAmount) revert InsufficientDisputeFee();
            escrowInfo.vendorPaidDisputeFee = true;
        }
        
        escrowInfo.disputeInitiator = msg.sender;
        escrowInfo.disputeFeeDeadline = feeDeadline;
        escrowInfo.state = State.Disputed;
        
        emit DisputeInitiated(msg.sender, escrowInfo.disputeFeeAmount, feeDeadline);
    }

    /// @notice Counterparty pays their dispute fee to proceed with arbitration.
    function payDisputeFee() external payable onlyParticipant {
        if (escrowInfo.state != State.Disputed) revert BadState();
        if (msg.sender == escrowInfo.disputeInitiator) revert DisputeFeeAlreadyPaid();
        if (block.timestamp > escrowInfo.disputeFeeDeadline) revert DeadlineNotReached(); // Deadline passed, use resolveDisputeByDefault
        
        if (msg.sender == escrowInfo.buyer) {
            if (escrowInfo.buyerPaidDisputeFee) revert DisputeFeeAlreadyPaid();
            if (escrowInfo.buyerFeeReserve < escrowInfo.disputeFeeAmount) revert InsufficientDisputeFee();
            escrowInfo.buyerPaidDisputeFee = true;
        } else {
            if (escrowInfo.vendorPaidDisputeFee) revert DisputeFeeAlreadyPaid();
            if (msg.value < escrowInfo.disputeFeeAmount) revert InsufficientDisputeFee();
            escrowInfo.vendorPaidDisputeFee = true;
        }
        
        emit DisputeFeePaid(msg.sender, escrowInfo.disputeFeeAmount);
    }

    /// @notice If counterparty doesn't pay by deadline, initiator wins by default.
    /// @dev Initiator gets full fee refund, no arbiter involvement needed.
    function resolveDisputeByDefault() external nonReentrant {
        if (escrowInfo.state != State.Disputed) revert BadState();
        if (block.timestamp < escrowInfo.disputeFeeDeadline) revert DisputeFeeDeadlineNotPassed();
        if (escrowInfo.buyerPaidDisputeFee && escrowInfo.vendorPaidDisputeFee) revert BothPartiesNotPaid();
        
        address initiator = escrowInfo.disputeInitiator;
        uint256 projectAmount = escrowInfo.amount;
        uint256 disputeFee = escrowInfo.disputeFeeAmount;
        
        escrowInfo.amount = 0;
        
        if (initiator == escrowInfo.buyer) {
            // Buyer initiated, wins by default - gets project amount + full fee refund
            uint256 buyerTotal = projectAmount + escrowInfo.buyerFeeReserve;
            escrowInfo.buyerFeeReserve = 0;
            escrowInfo.state = State.Refunded;
            
            (bool ok, ) = payable(escrowInfo.buyer).call{value: buyerTotal}("");
            require(ok, "refund failed");
            
            emit DisputeResolvedByDefault(escrowInfo.buyer, "counterparty_didnt_pay");
            emit Refunded(escrowInfo.buyer, buyerTotal);
        } else {
            // Vendor initiated, wins by default - gets project amount + full fee refund
            uint256 vendorTotal = projectAmount + disputeFee;
            escrowInfo.state = State.Paid;
            
            (bool ok, ) = payable(escrowInfo.vendor).call{value: vendorTotal}("");
            require(ok, "payout failed");
            
            emit DisputeResolvedByDefault(escrowInfo.vendor, "counterparty_didnt_pay");
            emit Withdrawn(escrowInfo.vendor, vendorTotal);
        }
    }

    /// @notice Arbiter resolves to vendor -> vendor wins, buyer loses.
    /// @dev Vendor gets project amount + their dispute fee refunded. Buyer's fee split between arbiter & feeRecipient.
    function resolveToVendor() external onlyOwner nonReentrant {
        if (escrowInfo.arbiter == address(0)) revert NoArbiter();
        if (escrowInfo.state != State.Disputed) revert BadState();
        if (!escrowInfo.buyerPaidDisputeFee || !escrowInfo.vendorPaidDisputeFee) revert BothPartiesNotPaid();

        // if vendor had delivered a CID already, finalize it
        if (bytes(escrowInfo.proposedCID).length > 0) {
            emit ResultFinalized(escrowInfo.proposedCID, escrowInfo.proposedContentHash);
        }

        uint256 projectAmount = escrowInfo.amount;
        uint256 disputeFee = escrowInfo.disputeFeeAmount;
        
        // Winner (vendor) gets project + their dispute fee back
        uint256 vendorAmount = projectAmount + disputeFee;
        
        // Loser's (buyer's) fee split 50/50 between arbiter and fee recipient
        uint256 arbiterShare = disputeFee / 2;
        uint256 feeRecipientShare = disputeFee - arbiterShare; // Handle rounding
        
        escrowInfo.amount = 0;
        escrowInfo.buyerFeeReserve = 0;
        escrowInfo.state = State.Paid;

        // Pay arbiter
        (bool ok1, ) = payable(escrowInfo.arbiter).call{value: arbiterShare}("");
        require(ok1, "arbiter payment failed");
        emit FeePaid(escrowInfo.arbiter, arbiterShare, "arbitration_fee");

        // Pay fee recipient
        (bool ok2, ) = payable(escrowInfo.feeRecipient).call{value: feeRecipientShare}("");
        require(ok2, "fee recipient payment failed");
        emit FeePaid(escrowInfo.feeRecipient, feeRecipientShare, "loser_dispute_fee");

        // Pay vendor (winner)
        (bool ok3, ) = payable(escrowInfo.vendor).call{value: vendorAmount}("");
        require(ok3, "payout failed");

        emit ResolvedToVendor(msg.sender, vendorAmount);
        emit Withdrawn(escrowInfo.vendor, vendorAmount);
    }

    /// @notice Arbiter resolves to buyer -> buyer wins, vendor loses.
    /// @dev Buyer gets project amount + their dispute fee refunded. Vendor's fee split between arbiter & feeRecipient.
    function resolveToBuyer() external onlyOwner nonReentrant {
        if (escrowInfo.arbiter == address(0)) revert NoArbiter();
        if (escrowInfo.state != State.Disputed) revert BadState();
        if (!escrowInfo.buyerPaidDisputeFee || !escrowInfo.vendorPaidDisputeFee) revert BothPartiesNotPaid();

        uint256 projectAmount = escrowInfo.amount;
        uint256 disputeFee = escrowInfo.disputeFeeAmount;
        
        // Winner (buyer) gets project + their reserved fee back
        uint256 buyerAmount = projectAmount + escrowInfo.buyerFeeReserve;
        
        // Loser's (vendor's) fee split 50/50 between arbiter and fee recipient
        uint256 arbiterShare = disputeFee / 2;
        uint256 feeRecipientShare = disputeFee - arbiterShare; // Handle rounding
        
        escrowInfo.amount = 0;
        escrowInfo.buyerFeeReserve = 0;
        escrowInfo.state = State.Refunded;

        // Pay arbiter
        (bool ok1, ) = payable(escrowInfo.arbiter).call{value: arbiterShare}("");
        require(ok1, "arbiter payment failed");
        emit FeePaid(escrowInfo.arbiter, arbiterShare, "arbitration_fee");

        // Pay fee recipient
        (bool ok2, ) = payable(escrowInfo.feeRecipient).call{value: feeRecipientShare}("");
        require(ok2, "fee recipient payment failed");
        emit FeePaid(escrowInfo.feeRecipient, feeRecipientShare, "loser_dispute_fee");

        // Refund buyer (winner)
        (bool ok3, ) = payable(escrowInfo.buyer).call{value: buyerAmount}("");
        require(ok3, "refund failed");

        emit ResolvedToBuyer(msg.sender, buyerAmount);
        emit Refunded(escrowInfo.buyer, buyerAmount);
    }

    /// @notice After both parties approved, vendor pulls the payment (safer than push).
    /// @dev Vendor gets project amount. Buyer's 0.5% fee + vendor's 0.5% fee (1% total) go to feeRecipient.
    function withdraw() external onlyVendor nonReentrant {
        if (escrowInfo.state != State.Releasable) revert BadState();

        uint256 projectAmount = escrowInfo.amount;
        uint256 buyerFee = escrowInfo.buyerFeeReserve; // 0.5%
        uint256 vendorFee = (projectAmount * 50) / 10000; // 0.5%
        uint256 totalFee = buyerFee + vendorFee; // 1%
        uint256 vendorAmount = projectAmount - vendorFee;
        
        escrowInfo.amount = 0;
        escrowInfo.buyerFeeReserve = 0;
        escrowInfo.state = State.Paid;

        // Pay fee recipient
        (bool ok1, ) = payable(escrowInfo.feeRecipient).call{value: totalFee}("");
        require(ok1, "fee payment failed");
        emit FeePaid(escrowInfo.feeRecipient, totalFee, "normal_completion_fee");

        // Pay vendor
        (bool ok2, ) = payable(escrowInfo.vendor).call{value: vendorAmount}("");
        require(ok2, "withdraw failed");

        emit Withdrawn(escrowInfo.vendor, vendorAmount);
    }

    /// @notice If not approved by deadline, buyer can get a refund.
    /// @dev No fees charged - buyer gets full amount back (project + their 0.5% fee).
    function refundAfterDeadline() external onlyBuyer nonReentrant {
        if (escrowInfo.state != State.Funded && escrowInfo.state != State.Delivered) revert BadState();
        if (block.timestamp < escrowInfo.deadline) revert DeadlineNotReached();

        uint256 projectAmount = escrowInfo.amount;
        uint256 buyerFee = escrowInfo.buyerFeeReserve;
        uint256 totalRefund = projectAmount + buyerFee;
        
        escrowInfo.amount = 0;
        escrowInfo.buyerFeeReserve = 0;
        escrowInfo.state = State.Refunded;

        (bool ok, ) = payable(escrowInfo.buyer).call{value: totalRefund}("");
        require(ok, "refund failed");

        emit Refunded(escrowInfo.buyer, totalRefund);
    }

    // ------- View helpers -------

    function isReleasable() external view returns (bool) {
        return escrowInfo.state == State.Releasable && escrowInfo.amount > 0;
    }

    function participants() external view returns (address, address, address, address) {
        return (escrowInfo.buyer, escrowInfo.vendor, escrowInfo.arbiter, escrowInfo.feeRecipient);
    }

    function getState() external view returns (uint256) {
        return uint256(escrowInfo.state);
    }

    function getAllInfo() external view returns (EscrowInfo memory) {
        return escrowInfo;
    }
}
