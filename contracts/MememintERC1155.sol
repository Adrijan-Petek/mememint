// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title MememintERC1155
 * @notice Simple ERC-1155 with drop creation and payable minting that forwards ETH to a treasury.
 */
contract MememintERC1155 is ERC1155, Ownable, ReentrancyGuard, Pausable {
    struct Drop {
        uint256 priceWei;
        uint256 supply;
        uint256 minted;
        string uri;
        bool exists;
    }

    mapping(uint256 => Drop) public drops;
    address public treasury;

    event DropCreated(uint256 indexed id, uint256 priceWei, uint256 supply, string uri);
    event Minted(address indexed buyer, uint256 indexed id, uint256 amount, uint256 paid);

    constructor(address _treasury) ERC1155("") {
        require(_treasury != address(0), "zero treasury");
        treasury = _treasury;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "zero treasury");
        treasury = _treasury;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function createDrop(
        uint256 id,
        uint256 priceWei,
        uint256 supply,
        string calldata uri_
    ) external onlyOwner {
        require(!drops[id].exists, "drop exists");
        require(supply > 0, "supply>0");
        drops[id] = Drop({ priceWei: priceWei, supply: supply, minted: 0, uri: uri_, exists: true });
        emit DropCreated(id, priceWei, supply, uri_);
    }

    function uri(uint256 id) public view override returns (string memory) {
        require(drops[id].exists, "no drop");
        return drops[id].uri;
    }

    function getDrop(uint256 id) external view returns (uint256 priceWei, uint256 supply, uint256 minted, string memory metadataUri) {
        require(drops[id].exists, "no drop");
        Drop memory d = drops[id];
        return (d.priceWei, d.supply, d.minted, d.uri);
    }

    function getRemainingSupply(uint256 id) external view returns (uint256) {
        require(drops[id].exists, "no drop");
        return drops[id].supply - drops[id].minted;
    }

    function mint(uint256 id, uint256 amount) external payable nonReentrant whenNotPaused {
        Drop storage d = drops[id];
        require(d.exists, "no drop");
        require(amount > 0, "amount>0");
        require(d.minted + amount <= d.supply, "sold out");
        uint256 total = d.priceWei * amount;
        require(msg.value >= total, "insufficient ETH");
        d.minted += amount;
        _mint(msg.sender, id, amount, "");
        // forward funds to treasury
        (bool ok, ) = treasury.call{ value: total }("");
        require(ok, "treasury transfer failed");
        // refund excess
        if (msg.value > total) {
            (bool refundOk, ) = payable(msg.sender).call{ value: msg.value - total }("");
            require(refundOk, "refund failed");
        }
        emit Minted(msg.sender, id, amount, total);
    }
}
