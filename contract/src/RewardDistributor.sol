// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Interface to check if escrow was created by factory
interface IEscrowFactory {
    function isEscrowCreated(address escrow) external view returns (bool);
}

/**
 * @title RewardDistributor
 * @notice Centralized reward distribution contract for GRMPS tokens
 * @dev Allows owner to approve once, all escrows from authorized factories can distribute rewards
 * 
 * Benefits:
 * - Owner approves this contract once (not every escrow)
 * - Scalable for factory pattern with many escrows
 * - Authorize factory once, all its escrows (past and future) are automatically authorized
 * - Centralized control and monitoring
 */
contract RewardDistributor is Ownable {
    /// @notice The reward token (GRMPS)
    address public rewardToken;
    
    /// @notice The reward source (owner who holds GRMPS tokens)
    address public rewardSource;
    
    /// @notice Mapping of authorized factories (not individual escrows!)
    /// @dev When factory is authorized, ALL escrows it created (past and future) are authorized
    mapping(address => bool) public authorizedFactories;
    
    /// @notice Array of authorized factory addresses (for iteration)
    address[] public authorizedFactoryList;
    
    /// @notice Mapping of directly authorized callers (for escrows not from factory)
    mapping(address => bool) public authorizedCallers;
    
    /// @notice If true, skip authorization check (open mode)
    bool public openMode;
    
    event RewardTokenSet(address indexed token);
    event RewardSourceSet(address indexed source);
    event FactoryAuthorized(address indexed factory, bool authorized);
    event CallerAuthorized(address indexed caller, bool authorized);
    event OpenModeSet(bool open);
    event RewardDistributed(
        address indexed caller,
        address indexed recipient,
        uint256 amount,
        string reason
    );
    event RewardFailed(
        address indexed caller,
        address indexed recipient,
        uint256 amount,
        string reason
    );
    
    error UnauthorizedCaller();
    error InsufficientAllowance();
    error InvalidAddress();
    
    constructor(address _owner, address _rewardToken, address _rewardSource) Ownable(_owner) {
        if (_rewardToken == address(0) || _rewardSource == address(0)) revert InvalidAddress();
        rewardToken = _rewardToken;
        rewardSource = _rewardSource;
        emit RewardTokenSet(_rewardToken);
        emit RewardSourceSet(_rewardSource);
    }
    
    /// @notice Set the reward token address
    function setRewardToken(address _rewardToken) external onlyOwner {
        if (_rewardToken == address(0)) revert InvalidAddress();
        rewardToken = _rewardToken;
        emit RewardTokenSet(_rewardToken);
    }
    
    /// @notice Set the reward source (who holds the tokens)
    function setRewardSource(address _rewardSource) external onlyOwner {
        if (_rewardSource == address(0)) revert InvalidAddress();
        rewardSource = _rewardSource;
        emit RewardSourceSet(_rewardSource);
    }
    
    /// @notice Authorize or deauthorize a factory
    /// @dev When factory is authorized, ALL escrows it created (past and future) are automatically authorized
    /// @param _factory Address of the factory contract
    /// @param _authorized True to authorize, false to deauthorize
    function setAuthorizedFactory(address _factory, bool _authorized) external onlyOwner {
        bool wasAuthorized = authorizedFactories[_factory];
        authorizedFactories[_factory] = _authorized;
        
        // Update list: add if authorizing and not already in list, remove if deauthorizing
        if (_authorized && !wasAuthorized) {
            authorizedFactoryList.push(_factory);
        } else if (!_authorized && wasAuthorized) {
            // Remove from list
            for (uint256 i = 0; i < authorizedFactoryList.length; i++) {
                if (authorizedFactoryList[i] == _factory) {
                    // Replace with last element and pop
                    authorizedFactoryList[i] = authorizedFactoryList[authorizedFactoryList.length - 1];
                    authorizedFactoryList.pop();
                    break;
                }
            }
        }
        
        emit FactoryAuthorized(_factory, _authorized);
    }
    
    /// @notice Batch authorize multiple factories
    function setAuthorizedFactories(address[] calldata _factories, bool _authorized) external onlyOwner {
        for (uint256 i = 0; i < _factories.length; i++) {
            authorizedFactories[_factories[i]] = _authorized;
            emit FactoryAuthorized(_factories[i], _authorized);
        }
    }
    
    /// @notice Authorize or deauthorize a specific caller (for escrows not from factory)
    /// @param _caller Address to authorize (individual escrow or other contract)
    /// @param _authorized True to authorize, false to deauthorize
    function setAuthorizedCaller(address _caller, bool _authorized) external onlyOwner {
        authorizedCallers[_caller] = _authorized;
        emit CallerAuthorized(_caller, _authorized);
    }
    
    /// @notice Batch authorize multiple callers
    function setAuthorizedCallers(address[] calldata _callers, bool _authorized) external onlyOwner {
        for (uint256 i = 0; i < _callers.length; i++) {
            authorizedCallers[_callers[i]] = _authorized;
            emit CallerAuthorized(_callers[i], _authorized);
        }
    }
    
    /// @notice Set open mode (if true, any caller can request rewards - use with caution!)
    function setOpenMode(bool _open) external onlyOwner {
        openMode = _open;
        emit OpenModeSet(_open);
    }
    
    /// @notice Distribute rewards to recipients
    /// @dev Only authorized callers (escrow contracts from authorized factories) can call this
    /// @param _recipients Array of recipient addresses
    /// @param _amounts Array of amounts (must match recipients length)
    /// @param _reason Reason for distribution (e.g., "buyer_reward", "vendor_reward")
    /// @return success True if all transfers succeeded, false if any failed
    function distributeRewards(
        address[] calldata _recipients,
        uint256[] calldata _amounts,
        string calldata _reason
    ) external returns (bool success) {
        // Check authorization: open mode, directly authorized, or created by authorized factory
        if (!openMode && !_isAuthorized(msg.sender)) revert UnauthorizedCaller();
        
        require(_recipients.length == _amounts.length, "length mismatch");
        require(_recipients.length > 0, "empty arrays");
        
        // Calculate total amount needed
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }
        
        // Check allowance
        uint256 allowance = IERC20(rewardToken).allowance(rewardSource, address(this));
        if (allowance < totalAmount) {
            emit RewardFailed(msg.sender, address(0), totalAmount, "insufficient_allowance");
            return false;
        }
        
        // Distribute to each recipient
        success = true;
        for (uint256 i = 0; i < _recipients.length; i++) {
            if (_amounts[i] > 0 && _recipients[i] != address(0)) {
                bool ok = IERC20(rewardToken).transferFrom(rewardSource, _recipients[i], _amounts[i]);
                if (ok) {
                    emit RewardDistributed(msg.sender, _recipients[i], _amounts[i], _reason);
                } else {
                    emit RewardFailed(msg.sender, _recipients[i], _amounts[i], "transfer_failed");
                    success = false;
                }
            }
        }
        
        return success;
    }
    
    /// @notice Distribute single reward (convenience function)
    function distributeSingleReward(
        address _recipient,
        uint256 _amount,
        string calldata _reason
    ) external returns (bool) {
        address[] memory recipients = new address[](1);
        uint256[] memory amounts = new uint256[](1);
        recipients[0] = _recipient;
        amounts[0] = _amount;
        return this.distributeRewards(recipients, amounts, _reason);
    }
    
    /// @notice Check if a caller is authorized (public view)
    /// @dev Checks direct authorization or if created by authorized factory
    function isAuthorized(address _caller) external view returns (bool) {
        return openMode || _isAuthorized(_caller);
    }
    
    /// @notice Internal function to check authorization
    /// @dev Checks: 1) Direct authorization, 2) Created by any authorized factory
    function _isAuthorized(address _caller) internal view returns (bool) {
        // Check if directly authorized
        if (authorizedCallers[_caller]) return true;
        
        // Check if created by any authorized factory
        for (uint256 i = 0; i < authorizedFactoryList.length; i++) {
            address factory = authorizedFactoryList[i];
            try IEscrowFactory(factory).isEscrowCreated(_caller) returns (bool created) {
                if (created) return true;
            } catch {
                // Continue to next factory if this one fails
            }
        }
        
        return false;
    }
    
    /// @notice Check if caller is authorized by checking a specific factory
    /// @dev This is gas-efficient: only checks one factory per call
    /// @param _factory Factory address to check
    /// @return True if caller was created by this authorized factory
    function isAuthorizedByFactory(address _factory) external view returns (bool) {
        if (!authorizedFactories[_factory]) return false;
        try IEscrowFactory(_factory).isEscrowCreated(msg.sender) returns (bool created) {
            return created;
        } catch {
            return false;
        }
    }
    
    /// @notice Check if escrow was created by any of the provided factories
    /// @dev Caller provides factory addresses to check (gas-efficient approach)
    /// @param _escrow Escrow address to check
    /// @param _factories Array of factory addresses to check
    /// @return True if escrow was created by any authorized factory in the list
    function isEscrowFromFactories(address _escrow, address[] calldata _factories) external view returns (bool) {
        for (uint256 i = 0; i < _factories.length; i++) {
            if (authorizedFactories[_factories[i]]) {
                try IEscrowFactory(_factories[i]).isEscrowCreated(_escrow) returns (bool created) {
                    if (created) return true;
                } catch {
                    // Continue to next factory
                }
            }
        }
        return false;
    }
    
    /// @notice Get current allowance from reward source
    function getCurrentAllowance() external view returns (uint256) {
        return IERC20(rewardToken).allowance(rewardSource, address(this));
    }
    
    /// @notice Get reward source balance
    function getSourceBalance() external view returns (uint256) {
        return IERC20(rewardToken).balanceOf(rewardSource);
    }
    
    /// @notice Get number of authorized factories
    function getAuthorizedFactoryCount() external view returns (uint256) {
        return authorizedFactoryList.length;
    }
    
    /// @notice Get all authorized factories
    function getAuthorizedFactories() external view returns (address[] memory) {
        return authorizedFactoryList;
    }
}

