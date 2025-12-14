// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title IMemeMintLeaderboard
 * @notice Interface for the MemeMint leaderboard contract
 * @dev Defines the functions that the leaderboard contract must implement
 * @author Dev Team
 */
interface IMemeMintLeaderboard {
    struct LeaderboardEntry {
        address user;
        uint256 totalMints;
        uint256 lastMintTime;
    }

    /**
     * @notice Updates a minter's position in the leaderboard
     * @param user The address of the user to update
     * @param newTotalMints The new total number of mints for this user
     */
    function updateMinter(address user, uint256 newTotalMints) external;

    /**
     * @notice Gets the top minters from the leaderboard
     * @param count The number of top minters to return
     * @return Array of leaderboard entries for the top minters
     */
    function getTopMinters(uint256 count) external view returns (LeaderboardEntry[] memory);

    /**
     * @notice Gets a user's leaderboard entry and position
     * @param user The address of the user to query
     * @return entry The user's leaderboard entry
     * @return position The user's position in the leaderboard (0 if not in top 100)
     */
    function getUserEntry(address user) external view returns (LeaderboardEntry memory entry, uint256 position);

    /**
     * @notice Gets statistics about the current leaderboard state
     * @return totalMinters The total number of minters in the leaderboard
     * @return minMints The minimum number of mints required to be in the leaderboard
     */
    function getLeaderboardStats() external view returns (uint256 totalMinters, uint256 minMints);

    /**
     * @notice Checks if a user is in the top 100 minters
     * @param user The address of the user to check
     * @return True if the user is in the top 100, false otherwise
     */
    function isInTop100(address user) external view returns (bool);

    /**
     * @notice Gets the leaderboard entry at a specific position
     * @param position The position to query (1-100)
     * @return entry The leaderboard entry at the specified position
     */
    function getEntryAtPosition(uint256 position) external view returns (LeaderboardEntry memory entry);
}