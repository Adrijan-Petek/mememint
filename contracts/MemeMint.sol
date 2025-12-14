// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import {IMemeMintErrors} from "./interfaces/IMemeMintErrors.sol";
import {IMemeMintEvents} from "./interfaces/IMemeMintEvents.sol";
import {IMemeMintLeaderboard} from "./interfaces/IMemeMintLeaderboard.sol";
import {MemeMintTypes} from "./libraries/MemeMintTypes.sol";
import {MemeMintConstants} from "./libraries/MemeMintConstants.sol";

/**
 * @title MemeMint
 * @notice A secure, upgradeable minting contract that collects ETH fees for minting memes.
 * @dev UUPS upgradeable + Ownable2StepUpgradeable, with ReentrancyGuard and Pausable.
 * This contract uses proxy pattern for upgradeability and implements secure access controls.
 * @author Dev Team
 */
contract MemeMint is
    Initializable,
    UUPSUpgradeable,
    Ownable2StepUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IMemeMintErrors,
    IMemeMintEvents
{
    using AddressUpgradeable for address payable;
    using MemeMintConstants for uint256;

    /// @notice Current mint fee in wei
    uint256 private _mintFee;

    /// @notice Mapping to track user mints per day
    mapping(address => mapping(uint256 => uint256)) private userMintsPerDay;

    /// @notice Total number of mints (starts at 1 to avoid zero-to-non-zero writes)
    uint256 public totalMints;

    /// @notice Total revenue collected (starts at 1 wei to avoid zero-to-non-zero writes)
    uint256 public totalRevenue;

    /// @notice Address of the leaderboard contract
    address private _leaderboardAddress;

    /// @notice Mapping to track total mints per user (for leaderboard)
    mapping(address => uint256) private _userTotalMints;

    // Reserved storage gap for future upgrades
    // Reduced from 45 to 42 to account for the userMintsPerDay mapping, leaderboardAddress, and userTotalMints mapping
    uint256[42] private __gap;

    /**
     * @notice Constructor disables initializers for implementation contract
     * @dev Prevents implementation contract from being initialized directly
     */
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Accept ETH deposits (only owner)
     * @dev Allows only the contract owner to send ETH directly for operational purposes
     */
    receive() external payable {
        if (msg.sender != owner()) {
            revert InvalidFunctionCall();
        }
        // Accept ETH only from owner; treated as general deposit for contract operations
    }

    /**
     * @notice Reject plain calls with data
     * @dev Prevents unexpected function calls and maintains security
     */
    fallback() external payable {
        revert InvalidFunctionCall();
    }

    /**
     * @notice Initialize the contract with initial owner and mint fee (only callable once)
     * @dev Initializes all parent contracts in correct order. Can only be called once due to initializer modifier.
     * @param initialOwner The address that will own the contract
     * @param initialMintFee The initial mint fee in wei (must be within MIN_MINT_FEE to MAX_MINT_FEE range)
     */
    function initialize(address initialOwner, uint256 initialMintFee) external initializer {
        if (initialOwner == address(0)) {
            revert ZeroAddress();
        }
        if (initialMintFee < MemeMintConstants.MIN_MINT_FEE || initialMintFee > MemeMintConstants.MAX_MINT_FEE) {
            revert InvalidMintFee();
        }
        
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        // Set the initial owner
        _transferOwnership(initialOwner);

        // Initialize with non-zero values to avoid expensive zero-to-non-zero writes
        totalMints = 1;
        totalRevenue = 1;
        
        _setMintFee(initialMintFee);

        emit Initialized(initialOwner, initialMintFee);
    }

    /**
     * @notice Set the leaderboard contract address (only owner)
     * @dev Only the contract owner can call this function
     * @param leaderboardAddress The address of the leaderboard contract
     */
    function setLeaderboardAddress(address leaderboardAddress) external onlyOwner {
        if (leaderboardAddress == address(0)) {
            revert InvalidLeaderboardAddress();
        }
        _leaderboardAddress = leaderboardAddress;
    }

    /**
     * @notice Accept ownership of the leaderboard contract
     * @dev Only owner can call this. Completes two-step ownership transfer from leaderboard.
     *      Required because leaderboard uses Ownable2StepUpgradeable.
     */
    function acceptLeaderboardOwnership() external onlyOwner {
        if (_leaderboardAddress == address(0)) {
            revert InvalidLeaderboardAddress();
        }
        // Call acceptOwnership on the leaderboard contract
        (bool success, ) = _leaderboardAddress.call(abi.encodeWithSignature("acceptOwnership()"));
        require(success, "Failed to accept leaderboard ownership");
    }

    /**
     * @notice Set a new mint fee (only owner)
     * @dev Only the contract owner can call this function. Uses payable for gas optimization.
     * @param newFee The new mint fee in wei
     */
    function setMintFee(uint256 newFee) external payable nonReentrant onlyOwner {
        uint256 oldFee = _mintFee;
        _setMintFee(newFee);
        
        // Only emit event if fee actually changed
        if (oldFee != newFee) {
            emit MintFeeUpdated(oldFee, newFee);
        }
    }

    /**
     * @notice Mint a new meme (local generation)
     * @dev Requires payment of current mint fee, refunds excess.
     *      Uses nonReentrant and whenNotPaused protections.
     *      Includes rate limiting circuit breaker.
     */
    function mintMeme() external payable nonReentrant whenNotPaused {
        uint256 currentMintFee = _mintFee;
        if (msg.value < currentMintFee) {
            revert InsufficientPayment();
        }

        // Circuit breaker: Rate limit per user per day
        uint256 today = block.timestamp / 1 days;
        if (userMintsPerDay[msg.sender][today] > MemeMintConstants.MAX_MINTS_PER_USER_PER_DAY - 1) {
            emit RateLimitHit(msg.sender, today);
            revert RateLimitExceeded();
        }

        // Update mint counts
        unchecked {
            ++totalMints;
            totalRevenue += currentMintFee;
            ++userMintsPerDay[msg.sender][today];
        }

        // Update leaderboard (non-blocking)
        if (_leaderboardAddress != address(0)) {
            try IMemeMintLeaderboard(_leaderboardAddress).updateMinter(msg.sender, _userTotalMints[msg.sender] + 1) {
                // Leaderboard updated successfully
            } catch {
                // Silently fail if leaderboard update fails
            }
        }

        // Update user's total mints
        unchecked {
            ++_userTotalMints[msg.sender];
        }

        // Refund excess payment
        if (msg.value > currentMintFee) {
            unchecked {
                uint256 refundAmount = msg.value - currentMintFee;
                (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
                if (!success) {
                    revert RefundFailed();
                }
            }
        }

        emit MemeMinted(msg.sender, currentMintFee);
    }

    /**
     * @notice Withdraw all accumulated funds to owner
     * @dev Only owner can call this function. Uses payable for gas optimization.
     */
    function withdraw() external payable nonReentrant onlyOwner {
        uint256 balance = address(this).balance;
        
        if (balance == 0) {
            revert NoFundsToWithdraw();
        }

        address ownerAddress = owner();
        payable(ownerAddress).sendValue(balance);
        emit FundsWithdrawn(ownerAddress, balance);
    }

    /**
     * @notice Emergency withdraw function
     * @dev Only owner can call, immediate transfer via sendValue. Uses payable for gas optimization.
     */
    function emergencyWithdraw() external payable nonReentrant onlyOwner {
        uint256 balance = address(this).balance;
        
        if (balance == 0) {
            revert NoFundsToWithdraw();
        }

        address ownerAddress = owner();
        payable(ownerAddress).sendValue(balance);
        emit EmergencyWithdraw(ownerAddress, balance);
    }

    /**
     * @notice Pause the contract (stop minting)
     * @dev Only owner can call this function. Uses payable for gas optimization.
     */
    function pause() external payable onlyOwner nonReentrant {
        _pause();
        emit ContractPaused(msg.sender);
    }

    /**
     * @notice Unpause the contract (allow minting)
     * @dev Only owner can call this function. Uses payable for gas optimization.
     */
    function unpause() external payable onlyOwner nonReentrant {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

    /**
     * @notice Get the leaderboard contract address
     * @return The address of the leaderboard contract
     */
    function getLeaderboardAddress() external view returns (address) {
        return _leaderboardAddress;
    }

    /**
     * @notice Get actual mint count (adjusting for the initial offset)
     * @dev Returns the actual number of mints excluding the initial offset
     * @return The actual number of mints excluding the initial offset
     */
    function getActualMintCount() external view returns (uint256) {
        unchecked {
            return totalMints - 1;
        }
    }

    /**
     * @notice Get actual revenue (adjusting for the initial offset)
     * @dev Returns the actual revenue excluding the initial offset
     * @return The actual revenue excluding the initial offset
     */
    function getActualRevenue() external view returns (uint256) {
        unchecked {
            return totalRevenue - 1;
        }
    }

    /**
     * @notice Get the current mint fee
     * @return The current mint fee in wei
     */
    function mintFee() external view returns (uint256) {
        return _mintFee;
    }

    /**
     * @notice Get the number of mints a user has made today
     * @param user The address of the user
     * @return The number of mints the user has made today
     */
    function getUserMintsToday(address user) external view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        return userMintsPerDay[user][today];
    }

    /**
     * @notice Get the current contract balance
     * @dev View function to check contract's ETH balance
     * @return The balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Get user mints for a specific day
     * @dev Returns the number of mints a user has made today (for rate limiting transparency)
     * @param user The user address to check
     * @param day The day to check (in days since epoch)
     * @return The number of mints made by the user on that day
     */
    function getUserMintsPerDay(address user, uint256 day) external view returns (uint256) {
        return userMintsPerDay[user][day];
    }

    /**
     * @notice Get user total mints
     * @dev Returns the total number of mints a user has made
     * @param user The user address to check
     * @return The total number of mints made by the user
     */
    function getUserTotalMints(address user) external view returns (uint256) {
        return _userTotalMints[user];
    }

    /**
     * @notice Get contract statistics
     * @dev Returns comprehensive contract statistics in a single call
     * @return stats A Stats struct containing contract statistics
     */
    function getStats() external view returns (MemeMintTypes.Stats memory stats) {
        unchecked {
            stats.mints = totalMints - 1;
            stats.revenue = totalRevenue - 1;
        }
        stats.fee = _mintFee;
        stats.balance = address(this).balance;
        
        return stats;
    }

    /**
     * @notice Authorize contract upgrades (only owner)
     * @dev Authorize contract upgrades using UUPS pattern
     * @param newImplementation Address of the new implementation contract
     * @inheritdoc UUPSUpgradeable
     */
    function _authorizeUpgrade(address newImplementation) internal view override onlyOwner {
        if (newImplementation == address(0)) {
            revert ZeroAddress();
        }
        if (newImplementation.code.length == 0) {
            revert InvalidImplementation();
        }
    }

    /**
     * @notice Internal function to set mint fee with validation
     * @dev Validates fee range and updates storage
     * @param newFee The new mint fee to set
     */
    function _setMintFee(uint256 newFee) private {
        if (newFee < MemeMintConstants.MIN_MINT_FEE || newFee > MemeMintConstants.MAX_MINT_FEE) {
            revert InvalidMintFee();
        }
        
        if (_mintFee == newFee) {
            return;
        }
        
        _mintFee = newFee;
    }

    /**
     * @notice Reset user daily mint count (only owner - for testing/emergency)
     * @dev Only owner can call this function. Resets the daily mint count for a user.
     * @param user The user address to reset
     */
    function resetUserDailyMints(address user) external onlyOwner {
        uint256 today = block.timestamp / 1 days;
        userMintsPerDay[user][today] = 0;
    }
}

