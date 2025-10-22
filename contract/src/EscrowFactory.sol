// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

/// @title EscrowFactory
/// @notice Factory contract that deploys minimal proxy clones of the Escrow implementation
/// @dev Uses OpenZeppelin Clones (EIP-1167) for gas-efficient escrow deployment
interface IEscrow {
    function initialize(
        address buyer,
        address seller,
        address arbiter,
        address feeRecipient,
        uint256 feeBps,
        address paymentToken,
        uint256 amountWei
    ) external;
}

contract EscrowFactory {
    /// @notice Address of the Escrow implementation contract
    address public immutable implementation;
    
    /// @notice Owner of the factory (can be used for future access control)
    address public owner;

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
        bool deterministic
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
    /// @param newOwner Address of the new owner
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero address");
        owner = newOwner;
    }

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
    /// @return escrow Address of the newly created escrow clone
    function createEscrow(
        bytes32 jobId,
        address buyer,
        address seller,
        address arbiter,
        address feeRecipient,
        uint256 feeBps,
        address paymentToken,
        uint256 amountWei
    ) external returns (address escrow) {
        // Clone the implementation
        escrow = Clones.clone(implementation);
        
        // Initialize the clone with job-specific parameters
        IEscrow(escrow).initialize(
            buyer,
            seller,
            arbiter,
            feeRecipient,
            feeBps,
            paymentToken,
            amountWei
        );
        
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
            false
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
        bytes32 salt
    ) external returns (address escrow) {
        // Clone the implementation using CREATE2
        escrow = Clones.cloneDeterministic(implementation, salt);
        
        // Initialize the clone with job-specific parameters
        IEscrow(escrow).initialize(
            buyer,
            seller,
            arbiter,
            feeRecipient,
            feeBps,
            paymentToken,
            amountWei
        );
        
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
            true
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

