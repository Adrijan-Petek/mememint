// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IMemeMintErrors} from "./interfaces/IMemeMintErrors.sol";

/**
 * @title MemeMintLeaderboard
 * @notice Tracks the top 100 minters by total mint count
 * @dev Maintains a sorted leaderboard of minters, updated by the main MemeMint contract
 * @author Dev Team
 */
contract MemeMintLeaderboard is Initializable, UUPSUpgradeable, Ownable2StepUpgradeable, IMemeMintErrors {
    /// @notice Struct to represent a leaderboard entry
    struct LeaderboardEntry {
        address user;
        uint256 totalMints;
        uint256 lastMintTime;
    }

    /// @notice Array of top 100 minters (sorted by totalMints descending)
    LeaderboardEntry[100] private _leaderboard;

    /// @notice Mapping to track user positions in leaderboard (0 = not in top 100)
    mapping(address => uint256) private _userPositions;

    /// @notice Total number of unique minters tracked
    uint256 public totalUniqueMinters;

    /// @notice Minimum mints required to be in top 100 (last place)
    uint256 public minMintsForTop100;

    // Reserved storage gap for future upgrades
    uint256[45] private __gap;

    /// @notice Events
    /**
     * @notice Emitted when a user's position in the leaderboard is updated
     * @param user The address of the user whose position was updated
     * @param newPosition The new position of the user in the leaderboard
     * @param totalMints The total number of mints by this user
     */
    event LeaderboardUpdated(address indexed user, uint256 indexed newPosition, uint256 indexed totalMints);

    /**
     * @notice Emitted when a user is removed from the leaderboard
     * @param user The address of the user who was removed
     * @param oldPosition The position the user held before removal
     */
    event UserRemovedFromLeaderboard(address indexed user, uint256 indexed oldPosition);

    /**
     * @notice Constructor that disables initializers for upgradeable contract
     */
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the leaderboard contract
     * @param initialOwner The address that will own the contract
     */
    function initialize(address initialOwner) external initializer {
        if (initialOwner == address(0)) {
            revert InvalidUserAddress();
        }

        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        _transferOwnership(initialOwner);
    }

    /**
     * @notice Update leaderboard when a user mints
     * @dev Only callable by authorized contracts (like MemeMint)
     * @param user The address of the user who minted
     * @param newTotalMints The user's new total mint count
     */
    function updateMinter(address user, uint256 newTotalMints) external onlyOwner {
        if (user == address(0)) {
            revert InvalidUserAddress();
        }
        if (newTotalMints == 0) {
            revert InvalidMintCount();
        }

        uint256 currentPosition = _userPositions[user];

        // If user is already in top 100, update their position
        if (currentPosition > 0 && currentPosition < 101) {
            _updateExistingUser(newTotalMints, currentPosition - 1);
        } else {
            // User not in top 100, try to add them
            _tryAddNewUser(user, newTotalMints);
        }
    }

    /**
     * @notice Get the top N minters
     * @param count Number of top minters to return (max 100)
     * @return entries Array of leaderboard entries
     */
    function getTopMinters(uint256 count) external view returns (LeaderboardEntry[] memory) {
        if (count == 0 || count > 100) {
            revert InvalidCountRange();
        }

        uint256 actualCount = count < totalUniqueMinters ? count : totalUniqueMinters;
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](actualCount);

        for (uint256 i = 0; i < actualCount; ++i) {
            entries[i] = _leaderboard[i];
        }

        return entries;
    }

    /**
     * @notice Get a user's leaderboard entry and position
     * @param user The user address to query
     * @return entry The user's leaderboard entry
     * @return position The user's position (0 if not in top 100)
     */
    function getUserEntry(address user) external view returns (LeaderboardEntry memory entry, uint256 position) {
        position = _userPositions[user];
        if (position > 0) {
            entry = _leaderboard[position - 1];
        }
    }

    /**
     * @notice Get leaderboard statistics
     * @return totalMinters Total number of unique minters
     * @return minMints Minimum mints required to be in top 100
     */
    function getLeaderboardStats() external view returns (uint256 totalMinters, uint256 minMints) {
        totalMinters = totalUniqueMinters;
        minMints = minMintsForTop100;
    }

    /**
     * @notice Check if a user is in the top 100
     * @param user The user address to check
     * @return True if the user is in the top 100
     */
    function isInTop100(address user) external view returns (bool) {
        return _userPositions[user] > 0;
    }

    /**
     * @notice Get the entry at a specific position
     * @param position The position to query (1-100)
     * @return entry The leaderboard entry at that position
     */
    function getEntryAtPosition(uint256 position) external view returns (LeaderboardEntry memory entry) {
        if (position == 0 || position > 100) {
            revert InvalidPositionRange();
        }
        if (position > totalUniqueMinters) {
            revert PositionNotFilled();
        }

        entry = _leaderboard[position - 1];
    }

    /**
     * @notice Authorizes contract upgrades
     * @dev Only owner can upgrade the contract
     * @param newImplementation The address of the new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal view override onlyOwner {
        if (newImplementation == address(0)) {
            revert InvalidUserAddress();
        }
        if (newImplementation.code.length == 0) {
            revert InvalidImplementation();
        }
    }

    /**
     * @notice Update an existing user in the leaderboard
     * @param newTotalMints The user's new total mint count
     * @param currentIndex The current index in the leaderboard array
     */
    function _updateExistingUser(uint256 newTotalMints, uint256 currentIndex) private {
        LeaderboardEntry memory currentEntry = _leaderboard[currentIndex];

        // If mint count didn't increase, just update timestamp
        if (newTotalMints < currentEntry.totalMints + 1) {
            _leaderboard[currentIndex].lastMintTime = block.timestamp;
            return;
        }

        // Update the entry
        _leaderboard[currentIndex].totalMints = newTotalMints;
        _leaderboard[currentIndex].lastMintTime = block.timestamp;

        // Bubble up if needed
        _bubbleUp(currentIndex);
    }

    /**
     * @notice Try to add a new user to the leaderboard
     * @param user The user address
     * @param totalMints The user's total mint count
     */
    function _tryAddNewUser(address user, uint256 totalMints) private {
        if (totalUniqueMinters < 100) {
            // Add to end if leaderboard not full
            uint256 newIndex = totalUniqueMinters;
            _leaderboard[newIndex] = LeaderboardEntry(user, totalMints, block.timestamp);
            _userPositions[user] = newIndex + 1;
            ++totalUniqueMinters;
            _bubbleUp(newIndex);
            emit LeaderboardUpdated(user, _userPositions[user], totalMints);
            return;
        }

        if (totalMints < minMintsForTop100 + 1) return;

        // Find and replace minimum user
        uint256 minIndex = _findMinIndex();
        address replacedUser = _leaderboard[minIndex].user;
        _userPositions[replacedUser] = 0;
        _leaderboard[minIndex] = LeaderboardEntry(user, totalMints, block.timestamp);
        _userPositions[user] = minIndex + 1;
        _bubbleUp(minIndex);
        emit UserRemovedFromLeaderboard(replacedUser, minIndex + 1);
        emit LeaderboardUpdated(user, _userPositions[user], totalMints);
    }

    /**
     * @notice Bubble up an entry to its correct position in the sorted leaderboard
     * @param index The index to start bubbling from
     */
    function _bubbleUp(uint256 index) private {
        while (index > 0) {
            uint256 parentIndex = (index - 1) / 2;

            if (_leaderboard[index].totalMints < _leaderboard[parentIndex].totalMints + 1) {
                break; // Correct position found
            }

            // Swap with parent
            LeaderboardEntry memory temp = _leaderboard[index];
            _leaderboard[index] = _leaderboard[parentIndex];
            _leaderboard[parentIndex] = temp;

            // Update position mappings
            _userPositions[_leaderboard[index].user] = index + 1;
            _userPositions[_leaderboard[parentIndex].user] = parentIndex + 1;

            index = parentIndex;
        }

        // Update min mints for top 100
        if (totalUniqueMinters > 99) {
            uint256 minMints = _leaderboard[0].totalMints;
            for (uint256 i = 1; i < 100; ++i) {
                if (_leaderboard[i].totalMints < minMints) {
                    minMints = _leaderboard[i].totalMints;
                }
            }
            minMintsForTop100 = minMints;
        }
    }

    /**
     * @notice Find the index of the user with minimum mints
     * @return The index of the minimum user
     */
    function _findMinIndex() private view returns (uint256) {
        uint256 minIndex = 0;
        uint256 currentMin = _leaderboard[0].totalMints;
        for (uint256 i = 1; i < 100; ++i) {
            if (_leaderboard[i].totalMints < currentMin) {
                currentMin = _leaderboard[i].totalMints;
                minIndex = i;
            }
        }
        return minIndex;
    }
}