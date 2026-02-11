// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

/// @title EscrowFactory
/// @notice Factory contract that deploys minimal proxy clones of the Escrow implementation
/// @dev Uses OpenZeppelin Clones (EIP-1167) for gas-efficient escrow deployment
    /// @notice Initialization parameters struct (must match Escrow.InitParams)
    struct InitParams {
        address buyer;
        address seller;
        address arbiter;
        address feeRecipient;
        uint256 feeBps;
        address paymentToken;
        uint256 amountWei;
        uint64 deadline;
        uint256 buyerFeeBps;
        uint256 vendorFeeBps;
        uint256 disputeFeeBps;
        uint256 rewardRateBps;
        address rewardDistributor;
        address rewardToken;
        uint256 rewardRatePer1e18;
    }

    interface IEscrow {
        function initialize(InitParams calldata params) external;
    }

contract EscrowFactory {
    /// @notice Address of the Escrow implementation contract
    address public immutable implementation;
    
    /// @notice Owner of the factory (can be used for future access control)
    address public owner;
    
    /// @notice Optional RewardDistributor contract address
    /// @dev If set, all new escrows will be configured to use this distributor
    address public rewardDistributor;
    
    /// @notice Reward token (GRMPS) address
    /// @dev If set, all new escrows will be configured with this reward token
    address public rewardToken;
    
    /// @notice Reward rate per 1e18 wei of project amount
    /// @dev GRMPS paid per 1e18 wei of project amount
    uint256 public rewardRatePer1e18;
    
    /// @notice Mapping to track all escrows created by this factory
    mapping(address => bool) public isEscrowCreated;

    /// @notice Emitted when a new escrow clone is created
    /// @param jobId Unique identifier for the job/escrow
    /// @param escrow Address of the newly created escrow clone
    /// @param buyer Address of the buyer
    /// @param seller Address of the seller
    /// @param arbiter Address of the arbiter (address(0) if none)
    /// @param feeRecipient Address that receives platform fees
    /// @param feeBps Fee in basis points
    /// @param paymentToken Token address (address(0) for native BNB)
    /// @param amountWei Amount in wei or token decimals
    /// @param deterministic Whether this was a deterministic deployment
    /// @param deadline Project deadline timestamp
    /// @param buyerFeeBps Buyer fee in basis points
    /// @param vendorFeeBps Vendor fee in basis points
    /// @param disputeFeeBps Dispute fee in basis points
    /// @param rewardRateBps Reward rate in basis points
    event EscrowCreated(
        bytes32 indexed jobId,
        address indexed escrow,
        address indexed buyer,
        address seller,
        address arbiter,
        address feeRecipient,
        uint256 feeBps,
        address paymentToken,
        uint256 amountWei,
        bool deterministic,
        uint64 deadline,
        uint256 buyerFeeBps,
        uint256 vendorFeeBps,
        uint256 disputeFeeBps,
        uint256 rewardRateBps
    );

    error NotOwner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    /// @notice Initialize the factory with an implementation contract
    /// @param _implementation Address of the deployed Escrow implementation
    constructor(address _implementation) {
        require(_implementation != address(0), "zero implementation");
        implementation = _implementation;
        owner = msg.sender;
    }

    /// @notice Transfer ownership of the factory
    /// @param newOwner Address of the new owner (can be a Gnosis Safe multisig)
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero address");
        address old = owner;
        owner = newOwner;
        emit OwnershipTransferred(old, newOwner);
    }
    
    /// @notice Set the RewardDistributor contract address
    /// @dev If set, all new escrows will be configured to use this distributor automatically
    /// @param _rewardDistributor Address of the RewardDistributor contract (or address(0) to disable)
    function setRewardDistributor(address _rewardDistributor) external onlyOwner {
        rewardDistributor = _rewardDistributor;
        emit RewardDistributorSet(_rewardDistributor);
    }
    
    /// @notice Set the reward token (GRMPS) address
    /// @dev If set, all new escrows will be configured with this reward token
    /// @param _rewardToken Address of the reward token (or address(0) to disable rewards)
    function setRewardToken(address _rewardToken) external onlyOwner {
        rewardToken = _rewardToken;
        emit RewardTokenSet(_rewardToken);
    }
    
    /// @notice Set the reward rate per 1e18 wei
    /// @dev GRMPS paid per 1e18 wei of project amount
    /// @param _rewardRatePer1e18 Reward rate (e.g., 30000000000000000000000 for 30000 GRMPS per 1 BNB)
    function setRewardRatePer1e18(uint256 _rewardRatePer1e18) external onlyOwner {
        rewardRatePer1e18 = _rewardRatePer1e18;
        emit RewardRateSet(_rewardRatePer1e18);
    }

    /// @notice Emitted when ownership is transferred
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    /// @notice Emitted when reward distributor is set
    event RewardDistributorSet(address indexed rewardDistributor);
    
    /// @notice Emitted when reward token is set
    event RewardTokenSet(address indexed rewardToken);
    
    /// @notice Emitted when reward rate is set
    event RewardRateSet(uint256 rewardRatePer1e18);

    /// @notice Create a new non-deterministic escrow clone
    /// @dev Uses Clones.clone() which is cheaper than deploying the full contract
    /// @param jobId Unique identifier for this job/escrow
    /// @param buyer Address of the buyer
    /// @param seller Address of the seller/vendor
    /// @param arbiter Address of the arbiter (use address(0) for no arbiter)
    /// @param feeRecipient Address that receives platform fees
    /// @param feeBps Fee in basis points (e.g., 100 = 1%)
    /// @param paymentToken Address of payment token (address(0) for native BNB)
    /// @param amountWei Amount in wei (for BNB) or token decimals (for ERC20)
    /// @param deadline Unix timestamp deadline for the escrow
    /// @param buyerFeeBps Buyer fee in basis points (e.g., 50 = 0.5%)
    /// @param vendorFeeBps Vendor fee in basis points (e.g., 50 = 0.5%)
    /// @param disputeFeeBps Dispute fee in basis points (e.g., 50 = 0.5%)
    /// @param rewardRateBps Reward rate in basis points (e.g., 25 = 0.25%)
    /// @return escrow Address of the newly created escrow clone
    function createEscrow(
        bytes32 jobId,
        address buyer,
        address seller,
        address arbiter,
        address feeRecipient,
        uint256 feeBps,
        address paymentToken,
        uint256 amountWei,
        uint64 deadline,
        uint256 buyerFeeBps,
        uint256 vendorFeeBps,
        uint256 disputeFeeBps,
        uint256 rewardRateBps
    ) external returns (address escrow) {
        // Clone the implementation
        escrow = Clones.clone(implementation);
        
        // Initialize the clone with job-specific parameters using struct
        IEscrow(escrow).initialize(InitParams({
            buyer: buyer,
            seller: seller,
            arbiter: arbiter,
            feeRecipient: feeRecipient,
            feeBps: feeBps,
            paymentToken: paymentToken,
            amountWei: amountWei,
            deadline: deadline,
            buyerFeeBps: buyerFeeBps,
            vendorFeeBps: vendorFeeBps,
            disputeFeeBps: disputeFeeBps,
            rewardRateBps: rewardRateBps,
            rewardDistributor: rewardDistributor,
            rewardToken: rewardToken,
            rewardRatePer1e18: rewardRatePer1e18
        }));
        
        // Track that this escrow was created by this factory
        isEscrowCreated[escrow] = true;
        
        emit EscrowCreated(
            jobId,
            escrow,
            buyer,
            seller,
            arbiter,
            feeRecipient,
            feeBps,
            paymentToken,
            amountWei,
            false,
            deadline,
            buyerFeeBps,
            vendorFeeBps,
            disputeFeeBps,
            rewardRateBps
        );
    }

    /// @notice Create a new deterministic escrow clone using CREATE2
    /// @dev Allows predicting the escrow address before deployment
    /// @param jobId Unique identifier for this job/escrow
    /// @param buyer Address of the buyer
    /// @param seller Address of the seller/vendor
    /// @param arbiter Address of the arbiter (use address(0) for no arbiter)
    /// @param feeRecipient Address that receives platform fees
    /// @param feeBps Fee in basis points (e.g., 100 = 1%)
    /// @param paymentToken Address of payment token (address(0) for native BNB)
    /// @param amountWei Amount in wei (for BNB) or token decimals (for ERC20)
    /// @param deadline Unix timestamp deadline for the escrow
    /// @param buyerFeeBps Buyer fee in basis points (e.g., 50 = 0.5%)
    /// @param vendorFeeBps Vendor fee in basis points (e.g., 50 = 0.5%)
    /// @param disputeFeeBps Dispute fee in basis points (e.g., 50 = 0.5%)
    /// @param rewardRateBps Reward rate in basis points (e.g., 25 = 0.25%)
    /// @param salt Unique salt for CREATE2 (can be derived from jobId + parties)
    /// @return escrow Address of the newly created escrow clone
    function createEscrowDeterministic(
        bytes32 jobId,
        address buyer,
        address seller,
        address arbiter,
        address feeRecipient,
        uint256 feeBps,
        address paymentToken,
        uint256 amountWei,
        uint64 deadline,
        uint256 buyerFeeBps,
        uint256 vendorFeeBps,
        uint256 disputeFeeBps,
        uint256 rewardRateBps,
        bytes32 salt
    ) external returns (address escrow) {
        // Clone the implementation using CREATE2
        escrow = Clones.cloneDeterministic(implementation, salt);
        
        // Initialize the clone with job-specific parameters using struct
        IEscrow(escrow).initialize(InitParams({
            buyer: buyer,
            seller: seller,
            arbiter: arbiter,
            feeRecipient: feeRecipient,
            feeBps: feeBps,
            paymentToken: paymentToken,
            amountWei: amountWei,
            deadline: deadline,
            buyerFeeBps: buyerFeeBps,
            vendorFeeBps: vendorFeeBps,
            disputeFeeBps: disputeFeeBps,
            rewardRateBps: rewardRateBps,
            rewardDistributor: rewardDistributor,
            rewardToken: rewardToken,
            rewardRatePer1e18: rewardRatePer1e18
        }));
        
        // Track that this escrow was created by this factory
        isEscrowCreated[escrow] = true;
        
        emit EscrowCreated(
            jobId,
            escrow,
            buyer,
            seller,
            arbiter,
            feeRecipient,
            feeBps,
            paymentToken,
            amountWei,
            true,
            deadline,
            buyerFeeBps,
            vendorFeeBps,
            disputeFeeBps,
            rewardRateBps
        );
    }

    /// @notice Predict the address of a deterministic escrow clone
    /// @dev Useful for off-chain address calculation before deployment
    /// @param salt The salt that will be used for CREATE2
    /// @return predicted The predicted address of the escrow clone
    function predictEscrow(bytes32 salt) external view returns (address predicted) {
        return Clones.predictDeterministicAddress(implementation, salt, address(this));
    }
}

