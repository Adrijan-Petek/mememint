import { expect } from "chai";
import hardhat from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const { ethers } = hardhat;

describe("Treasury Contract", function () {
  let Treasury;
  let MockERC20;
  let treasury;
  let token1, token2;
  let owner, user1, user2;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock ERC20 tokens
    MockERC20 = await ethers.getContractFactory("MockERC20");
    token1 = await MockERC20.deploy("Token1", "TK1");
    token2 = await MockERC20.deploy("Token2", "TK2");
    await token1.waitForDeployment();
    await token2.waitForDeployment();

    // Deploy Treasury contract
    Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy();
    await treasury.waitForDeployment();
  });

  describe("Token Management", function () {
    it("Should allow owner to add supported tokens", async function () {
      await treasury.addSupportedToken(await token1.getAddress(), "TK1", "tk1.png");

      expect(await treasury.isSupportedToken(await token1.getAddress())).to.be.true;
      expect(await treasury.tokenSymbols(await token1.getAddress())).to.equal("TK1");
      expect(await treasury.tokenImages(await token1.getAddress())).to.equal("tk1.png");

      const supportedTokens = await treasury.getSupportedTokens();
      expect(supportedTokens).to.include(await token1.getAddress());
    });

    it("Should allow owner to remove supported tokens", async function () {
      await treasury.addSupportedToken(await token1.getAddress(), "TK1", "tk1.png");
      expect(await treasury.isSupportedToken(await token1.getAddress())).to.be.true;

      await treasury.removeSupportedToken(await token1.getAddress());
      expect(await treasury.isSupportedToken(await token1.getAddress())).to.be.false;

      const supportedTokens = await treasury.getSupportedTokens();
      expect(supportedTokens).to.not.include(await token1.getAddress());
    });

    it("Should reject adding duplicate tokens", async function () {
      await treasury.addSupportedToken(await token1.getAddress(), "TK1", "tk1.png");
      await expect(
        treasury.addSupportedToken(await token1.getAddress(), "TK1", "tk1.png")
      ).to.be.revertedWith("Token already supported");
    });

    it("Should reject removing non-supported tokens", async function () {
      await expect(
        treasury.removeSupportedToken(await token1.getAddress())
      ).to.be.revertedWith("Token not supported");
    });
  });

  describe("Reward Management", function () {
    beforeEach(async function () {
      // Add tokens
      await treasury.addSupportedToken(await token1.getAddress(), "TK1", "tk1.png");
      await treasury.addSupportedToken(await token2.getAddress(), "TK2", "tk2.png");

      // Mint tokens to treasury
      await token1.mint(await treasury.getAddress(), ethers.parseEther("1000"));
      await token2.mint(await treasury.getAddress(), ethers.parseEther("1000"));
    });

    it("Should allow owner to add rewards", async function () {
      const amount = ethers.parseEther("100");
      await treasury.addReward(user1.address, await token1.getAddress(), amount);

      expect(await treasury.getUserReward(user1.address, await token1.getAddress())).to.equal(amount);
    });

    it("Should allow users to claim rewards", async function () {
      const amount = ethers.parseEther("100");
      await treasury.addReward(user1.address, await token1.getAddress(), amount);

      const initialBalance = await token1.balanceOf(user1.address);
      await treasury.connect(user1).claimReward(await token1.getAddress());

      expect(await token1.balanceOf(user1.address)).to.equal(initialBalance + amount);
      expect(await treasury.getUserReward(user1.address, await token1.getAddress())).to.equal(0);
    });

    it("Should reject claiming zero rewards", async function () {
      await expect(
        treasury.connect(user1).claimReward(await token1.getAddress())
      ).to.be.revertedWith("No rewards to claim");
    });

    it("Should reject adding rewards for unsupported tokens", async function () {
      const mockToken = await MockERC20.deploy("Mock", "MCK");
      await mockToken.waitForDeployment();

      await expect(
        treasury.addReward(user1.address, await mockToken.getAddress(), ethers.parseEther("100"))
      ).to.be.revertedWith("Token not supported");
    });

    it("Should allow owner to distribute rewards directly", async function () {
      const amount = ethers.parseEther("50");
      const initialBalance = await token1.balanceOf(user2.address);

      await treasury.distributeReward(await token1.getAddress(), user2.address, amount);

      expect(await token1.balanceOf(user2.address)).to.equal(initialBalance + amount);
    });
  });

  describe("ETH Handling", function () {
    it("Should receive ETH from external transfers", async function () {
      const amount = ethers.parseEther("1");
      await owner.sendTransaction({
        to: await treasury.getAddress(),
        value: amount
      });

      expect(await ethers.provider.getBalance(await treasury.getAddress())).to.equal(amount);
    });

    it("Should allow owner to withdraw ETH", async function () {
      const amount = ethers.parseEther("1");
      await owner.sendTransaction({
        to: await treasury.getAddress(),
        value: amount
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      await treasury.withdrawETH(amount);

      expect(await ethers.provider.getBalance(await treasury.getAddress())).to.equal(0);
    });
  });

  describe("Token Balance Queries", function () {
    it("Should return correct treasury token balance", async function () {
      const amount = ethers.parseEther("500");
      await token1.mint(await treasury.getAddress(), amount);

      expect(await treasury.treasuryBalanceToken(await token1.getAddress())).to.equal(amount);
    });

    it("Should allow owner to withdraw tokens", async function () {
      const amount = ethers.parseEther("100");
      await token1.mint(await treasury.getAddress(), amount);

      const treasuryBalanceBefore = await token1.balanceOf(await treasury.getAddress());
      const ownerBalanceBefore = await token1.balanceOf(owner.address);

      await treasury.withdrawTokens(await token1.getAddress(), amount);

      const treasuryBalanceAfter = await token1.balanceOf(await treasury.getAddress());
      const ownerBalanceAfter = await token1.balanceOf(owner.address);

      expect(treasuryBalanceAfter).to.equal(treasuryBalanceBefore - amount);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + amount);
    });
  });

  describe("Access Control", function () {
    it("Should reject non-owner from admin functions", async function () {
      await expect(
        treasury.connect(user1).addSupportedToken(await token1.getAddress(), "TK1", "tk1.png")
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        treasury.connect(user1).addReward(user2.address, await token1.getAddress(), 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Pause Functionality", function () {
    beforeEach(async function () {
      await treasury.addSupportedToken(await token1.getAddress(), "TK1", "tk1.png");
      await treasury.addReward(user1.address, await token1.getAddress(), ethers.parseEther("100"));
      // Mint tokens to treasury for claiming
      await token1.mint(await treasury.getAddress(), ethers.parseEther("100"));
    });

    it("Should allow owner to pause and unpause", async function () {
      // Pause contract
      await treasury.pause();
      expect(await treasury.paused()).to.be.true;

      // Unpause contract
      await treasury.unpause();
      expect(await treasury.paused()).to.be.false;
    });

    it("Should prevent reward claiming when paused", async function () {
      await treasury.pause();

      await expect(
        treasury.connect(user1).claimReward(await token1.getAddress())
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow reward claiming when not paused", async function () {
      await expect(
        treasury.connect(user1).claimReward(await token1.getAddress())
      ).to.not.be.reverted;
    });

    it("Should reject non-owner from pausing", async function () {
      await expect(
        treasury.connect(user1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      await treasury.addSupportedToken(await token1.getAddress(), "TK1", "tk1.png");
      await treasury.addSupportedToken(await token2.getAddress(), "TK2", "tk2.png");

      // Fund treasury with tokens
      await token1.mint(await treasury.getAddress(), ethers.parseEther("1000"));
      await token2.mint(await treasury.getAddress(), ethers.parseEther("500"));

      // Send ETH to treasury
      await owner.sendTransaction({
        to: await treasury.getAddress(),
        value: ethers.parseEther("10")
      });
    });

    it("Should allow emergency withdrawal of all tokens", async function () {
      const token1Balance = await token1.balanceOf(await treasury.getAddress());
      const ownerBalanceBefore = await token1.balanceOf(owner.address);

      await treasury.emergencyWithdrawAllTokens(await token1.getAddress());

      expect(await token1.balanceOf(await treasury.getAddress())).to.equal(0);
      expect(await token1.balanceOf(owner.address)).to.equal(ownerBalanceBefore + token1Balance);
    });

    it("Should allow emergency withdrawal of all ETH", async function () {
      const treasuryETHBalance = await ethers.provider.getBalance(await treasury.getAddress());
      const ownerETHBalanceBefore = await ethers.provider.getBalance(owner.address);

      await treasury.emergencyWithdrawAllETH();

      expect(await ethers.provider.getBalance(await treasury.getAddress())).to.equal(0);
    });

    it("Should reject emergency withdrawal when no tokens", async function () {
      // Withdraw all tokens first
      await treasury.emergencyWithdrawAllTokens(await token1.getAddress());

      await expect(
        treasury.emergencyWithdrawAllTokens(await token1.getAddress())
      ).to.be.revertedWith("No tokens to withdraw");
    });

    it("Should reject emergency ETH withdrawal when no ETH", async function () {
      // Withdraw all ETH first
      await treasury.emergencyWithdrawAllETH();

      await expect(
        treasury.emergencyWithdrawAllETH()
      ).to.be.revertedWith("No ETH to withdraw");
    });

    it("Should reject non-owner from emergency functions", async function () {
      await expect(
        treasury.connect(user1).emergencyWithdrawAllTokens(await token1.getAddress())
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        treasury.connect(user1).emergencyWithdrawAllETH()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});