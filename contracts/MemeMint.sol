// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Mememint is Ownable, ReentrancyGuard {
    // Daily free generation tracking
    mapping(address => mapping(uint256 => uint256)) public userGenerationsPerDay;

    // Fee configuration
    uint256 public generationFee = 0.001 ether; // Configurable fee
    uint256 public dailyFreeLimit = 1; // 1 free generation per day

    // Treasury contract
    address public treasury;

    // Events
    event MemeGenerated(address indexed user, string templateId, string topText, string bottomText, bool isFree);
    event FeeUpdated(uint256 newFee);
    event TreasuryUpdated(address indexed newTreasury);

    constructor(address _treasury) {
        treasury = _treasury;
    }

    // Check if user can generate for free today
    function canGenerateFree(address user) public view returns (bool) {
        uint256 today = block.timestamp / 1 days;
        return userGenerationsPerDay[user][today] < dailyFreeLimit;
    }

    // Generate meme function (multi-function support)
    function generateMeme(
        address user,
        string memory templateId,
        string memory topText,
        string memory bottomText
    ) external payable nonReentrant {
        bool isFree = canGenerateFree(user);

        if (!isFree) {
            require(msg.value >= generationFee, "Insufficient fee");

            // Send fee to treasury
            payable(treasury).transfer(msg.value);
        }

        // Update user generation tracking
        if (isFree) {
            uint256 today = block.timestamp / 1 days;
            userGenerationsPerDay[user][today]++;
        }

        // Emit event
        emit MemeGenerated(user, templateId, topText, bottomText, isFree);
    }

    // Play game function (alternative interaction)
    function playGame(address user) external payable nonReentrant {
        bool isFree = canGenerateFree(user);

        if (!isFree) {
            require(msg.value >= generationFee, "Insufficient fee");

            // Send fee to treasury
            payable(treasury).transfer(msg.value);
        }

        // Update user generation tracking
        if (isFree) {
            uint256 today = block.timestamp / 1 days;
            userGenerationsPerDay[user][today]++;
        }

        // Emit event (using empty strings for template data)
        emit MemeGenerated(user, "game", "", "", isFree);
    }

    // Set generation fee (owner only)
    function setGenerationFee(uint256 _fee) external onlyOwner {
        generationFee = _fee;
        emit FeeUpdated(_fee);
    }

    // Update treasury address (owner only)
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    // Withdraw stuck ETH (emergency)
    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

