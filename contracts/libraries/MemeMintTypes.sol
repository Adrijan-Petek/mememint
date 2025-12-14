// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title MemeMintTypes
 * @notice Library containing all data types and structs for the MemeMint contract
 * @dev Separating types improves code organization and reusability
 * @author Dev Team
 */
library MemeMintTypes {
    /**
     * @notice Stats struct returned by getStats()
     * @dev Contains all relevant contract statistics
     */
    struct Stats {
        uint256 mints;
        uint256 revenue;
        uint256 fee;
        uint256 balance;
    }
}