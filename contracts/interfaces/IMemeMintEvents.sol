// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title IMemeMintEvents
 * @notice Interface containing all events for the MemeMint contract
 * @dev Separating events improves code organization and makes the contract more readable
 * @author Dev Team
 */
interface IMemeMintEvents {
    /// @notice Event emitted when a meme is minted
    /// @param user The address that minted (indexed for filtering)
    /// @param feePaid Fee paid for the mint (in wei) (indexed for filtering)
    event MemeMinted(address indexed user, uint256 indexed feePaid);

    /// @notice Event emitted when mint fee is updated
    /// @param oldFee Previous mint fee (indexed for filtering)
    /// @param newFee New mint fee (indexed for filtering)
    event MintFeeUpdated(uint256 indexed oldFee, uint256 indexed newFee);

    /// @notice Event emitted when funds are withdrawn
    /// @param owner The owner who withdrew funds (indexed for filtering)
    /// @param amount Amount withdrawn (indexed for filtering)
    event FundsWithdrawn(address indexed owner, uint256 indexed amount);

    /// @notice Event emitted during emergency withdrawal
    /// @param owner The owner who performed emergency withdrawal (indexed for filtering)
    /// @param amount Amount withdrawn (indexed for filtering)
    event EmergencyWithdraw(address indexed owner, uint256 indexed amount);

    /// @notice Event emitted when contract is initialized
    /// @param owner The initial owner of the contract (indexed for filtering)
    /// @param mintFee The initial mint fee (indexed for filtering)
    event Initialized(address indexed owner, uint256 indexed mintFee);

    /// @notice Event emitted when contract is paused
    /// @param owner The owner who paused the contract
    event ContractPaused(address indexed owner);

    /// @notice Event emitted when contract is unpaused
    /// @param owner The owner who unpaused the contract
    event ContractUnpaused(address indexed owner);

    /// @notice Event emitted when rate limit is hit
    /// @param user The user who hit the rate limit (indexed for filtering)
    /// @param day The day when the rate limit was hit (indexed for filtering)
    event RateLimitHit(address indexed user, uint256 indexed day);
}