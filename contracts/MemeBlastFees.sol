// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MemeBlastFees is Ownable, ReentrancyGuard {
    address public treasury;
    uint256 public playFee;
    mapping(address => bool) public admins;

    event TreasuryUpdated(address indexed treasury);
    event FeeUpdated(uint256 fee);
    event AdminUpdated(address indexed admin, bool enabled);
    event GameStarted(address indexed player, uint256 paid);
    event GameRestarted(address indexed player, uint256 paid);

    constructor(address _treasury) {
        treasury = _treasury;
        playFee = 0;
    }

    modifier onlyAdminOrOwner() {
        require(owner() == _msgSender() || admins[_msgSender()], "Not authorized");
        _;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setPlayFee(uint256 _fee) external onlyAdminOrOwner {
        playFee = _fee;
        emit FeeUpdated(_fee);
    }

    function setAdmin(address admin, bool enabled) external onlyOwner {
        admins[admin] = enabled;
        emit AdminUpdated(admin, enabled);
    }

    function startGame() external payable nonReentrant {
        if (playFee > 0) {
            require(msg.value >= playFee, "Insufficient fee");
            payable(treasury).transfer(msg.value);
        }
        emit GameStarted(msg.sender, msg.value);
    }

    function playAgain() external payable nonReentrant {
        if (playFee > 0) {
            require(msg.value >= playFee, "Insufficient fee");
            payable(treasury).transfer(msg.value);
        }
        emit GameRestarted(msg.sender, msg.value);
    }
}
