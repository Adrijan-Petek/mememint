// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title MemeMintConstants
 * @notice Library containing all constants for the MemeMint contract
 * @dev Separating constants improves maintainability and reduces contract size
 * @author Dev Team
 */
library MemeMintConstants {
    /// @notice Minimum allowed mint fee
    uint256 internal constant MIN_MINT_FEE = 0.000017 ether;

    /// @notice Maximum allowed mint fee
    uint256 internal constant MAX_MINT_FEE = 0.1 ether;

    /// @notice Maximum mints per user per day (circuit breaker)
    uint256 internal constant MAX_MINTS_PER_USER_PER_DAY = 80;
}