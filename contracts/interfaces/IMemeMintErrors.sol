// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title IMemeMintErrors
 * @notice Interface containing all custom errors for the MemeMint contract
 * @dev Separating errors improves code organization and reusability
 * @author Dev Team
 */
interface IMemeMintErrors {
    /// @notice Error for insufficient payment
    error InsufficientPayment();

    /// @notice Error for invalid mint fee
    error InvalidMintFee();

    /// @notice Error when no funds available to withdraw
    error NoFundsToWithdraw();

    /// @notice Error when transfer fails
    error TransferFailed();

    /// @notice Error when refund fails
    error RefundFailed();

    /// @notice Error for invalid function calls
    error InvalidFunctionCall();

    /// @notice Error for zero address inputs
    error ZeroAddress();

    /// @notice Error for invalid implementation contract
    error InvalidImplementation();

    /// @notice Error for initialization failure
    error InitializationFailed();

    /// @notice Error for rate limit exceeded
    error RateLimitExceeded();

    /// @notice Error for invalid leaderboard address
    error InvalidLeaderboardAddress();

    /// @notice Error for invalid user address
    error InvalidUserAddress();

    /// @notice Error for invalid mint count
    error InvalidMintCount();

    /// @notice Error for invalid count range
    error InvalidCountRange();

    /// @notice Error for invalid position range
    error InvalidPositionRange();

    /// @notice Error for position not filled
    error PositionNotFilled();
}