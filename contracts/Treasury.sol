// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Treasury is Ownable, ReentrancyGuard, Pausable {
    // Supported tokens
    address[] public supportedTokens;
    mapping(address => bool) public isSupportedToken;
    mapping(address => string) public tokenSymbols;
    mapping(address => string) public tokenImages;

    // Reward tracking
    mapping(address => mapping(address => uint256)) public userRewards; // user => token => amount

    // Events
    event TokenAdded(address indexed token, string symbol, string image);
    event TokenRemoved(address indexed token);
    event RewardAdded(address indexed user, address indexed token, uint256 amount);
    event RewardClaimed(address indexed user, address indexed token, uint256 amount);
    event RewardDistributed(address indexed token, address indexed recipient, uint256 amount);
    event EmergencyWithdrawn(address indexed token, uint256 amount);
    event EmergencyETHWithdrawn(uint256 amount);

    // Add supported token
    function addSupportedToken(
        address token,
        string memory symbol,
        string memory image
    ) external onlyOwner {
        require(!isSupportedToken[token], "Token already supported");

        supportedTokens.push(token);
        isSupportedToken[token] = true;
        tokenSymbols[token] = symbol;
        tokenImages[token] = image;

        emit TokenAdded(token, symbol, image);
    }

    // Remove supported token
    function removeSupportedToken(address token) external onlyOwner {
        require(isSupportedToken[token], "Token not supported");

        isSupportedToken[token] = false;
        tokenSymbols[token] = "";
        tokenImages[token] = "";

        // Remove from array
        for (uint i = 0; i < supportedTokens.length; i++) {
            if (supportedTokens[i] == token) {
                supportedTokens[i] = supportedTokens[supportedTokens.length - 1];
                supportedTokens.pop();
                break;
            }
        }

        emit TokenRemoved(token);
    }

    // Get supported tokens
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    // Get treasury balance for token
    function treasuryBalanceToken(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    // Add reward for user (called by game logic/admin)
    function addReward(address user, address token, uint256 amount) external onlyOwner {
        require(isSupportedToken[token], "Token not supported");
        userRewards[user][token] += amount;
        emit RewardAdded(user, token, amount);
    }

    // Claim rewards
    function claimReward(address token) external nonReentrant whenNotPaused {
        uint256 amount = userRewards[msg.sender][token];
        require(amount > 0, "No rewards to claim");
        require(isSupportedToken[token], "Token not supported");

        userRewards[msg.sender][token] = 0;

        require(IERC20(token).transfer(msg.sender, amount), "Transfer failed");

        emit RewardClaimed(msg.sender, token, amount);
    }

    // Get user reward balance
    function getUserReward(address user, address token) external view returns (uint256) {
        return userRewards[user][token];
    }

    // Distribute reward directly (admin function)
    function distributeReward(
        address token,
        address recipient,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(isSupportedToken[token], "Token not supported");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");

        require(IERC20(token).transfer(recipient, amount), "Transfer failed");

        emit RewardDistributed(token, recipient, amount);
    }

    // Withdraw tokens (admin function)
    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "Transfer failed");
    }

    // Emergency withdraw all tokens of a specific type
    function emergencyWithdrawAllTokens(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(IERC20(token).transfer(owner(), balance), "Transfer failed");
        emit EmergencyWithdrawn(token, balance);
    }

    // Withdraw ETH (admin function)
    function withdrawETH(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }

    // Emergency withdraw all ETH
    function emergencyWithdrawAllETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(balance);
        emit EmergencyETHWithdrawn(balance);
    }

    // Pause contract (admin function)
    function pause() external onlyOwner {
        _pause();
    }

    // Unpause contract (admin function)
    function unpause() external onlyOwner {
        _unpause();
    }

    // Receive ETH from Mememint fees
    receive() external payable {}
}