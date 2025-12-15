import { expect } from "chai";
import hardhat from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const { ethers } = hardhat;

describe("Mememint Contract", function () {
  let Mememint;
  let Treasury;
  let mememint;
  let treasury;
  let owner, user1, user2;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy Treasury first
    Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy();
    await treasury.waitForDeployment();

    // Deploy Mememint contract
    Mememint = await ethers.getContractFactory("Mememint");
    mememint = await Mememint.deploy(await treasury.getAddress());
    await mememint.waitForDeployment();
  });

  describe("Initialization", function () {
    it("Should initialize with correct parameters", async function () {
      expect(await mememint.owner()).to.equal(owner.address);
      expect(await mememint.generationFee()).to.equal(ethers.parseEther("0.001"));
      expect(await mememint.dailyFreeLimit()).to.equal(1);
      expect(await mememint.treasury()).to.equal(await treasury.getAddress());
    });
  });

  describe("Free Generation", function () {
    it("Should allow free generation initially", async function () {
      expect(await mememint.canGenerateFree(user1.address)).to.be.true;
    });

    it("Should track free generations", async function () {
      const block = await ethers.provider.getBlock('latest');
      const today = Math.floor(block.timestamp / (24 * 60 * 60));

      // First free generation
      await mememint.connect(user1).generateMeme(user1.address, "test", "top", "bottom");

      expect(await mememint.userGenerationsPerDay(user1.address, today)).to.equal(1);
      expect(await mememint.canGenerateFree(user1.address)).to.be.false;
    });

    it("Should reset free generation after 24 hours", async function () {
      // Use free generation
      await mememint.connect(user1).generateMeme(user1.address, "test", "top", "bottom");
      expect(await mememint.canGenerateFree(user1.address)).to.be.false;

      // Advance time by 24 hours
      await time.increase(24 * 60 * 60);

      expect(await mememint.canGenerateFree(user1.address)).to.be.true;
    });
  });

  describe("Paid Generation", function () {
    it("Should accept payment for generation", async function () {
      const fee = await mememint.generationFee();

      // Use up free generation first
      await mememint.connect(user1).generateMeme(user1.address, "test", "top", "bottom");

      // Check treasury balance before
      const treasuryBalanceBefore = await ethers.provider.getBalance(await treasury.getAddress());

      // Now pay for generation
      await expect(
        mememint.connect(user1).generateMeme(user1.address, "test2", "top2", "bottom2", { value: fee })
      ).to.not.be.reverted;

      // Check treasury balance after
      const treasuryBalanceAfter = await ethers.provider.getBalance(await treasury.getAddress());
      expect(treasuryBalanceAfter).to.equal(treasuryBalanceBefore + fee);
    });

    it("Should reject insufficient payment", async function () {
      // Use up free generation first
      await mememint.connect(user1).generateMeme(user1.address, "test", "top", "bottom");

      // Try with insufficient payment
      await expect(
        mememint.connect(user1).generateMeme(user1.address, "test2", "top2", "bottom2", { value: ethers.parseEther("0.0001") })
      ).to.be.revertedWith("Insufficient fee");
    });
  });

  describe("Game Function", function () {
    it("Should work with playGame function", async function () {
      const fee = await mememint.generationFee();

      // Use up free generation first
      await mememint.connect(user1).generateMeme(user1.address, "test", "top", "bottom");

      // Check treasury balance before
      const treasuryBalanceBefore = await ethers.provider.getBalance(await treasury.getAddress());

      // Now use game function with payment
      await expect(
        mememint.connect(user1).playGame(user1.address, { value: fee })
      ).to.not.be.reverted;

      // Check treasury balance after
      const treasuryBalanceAfter = await ethers.provider.getBalance(await treasury.getAddress());
      expect(treasuryBalanceAfter).to.equal(treasuryBalanceBefore + fee);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set generation fee", async function () {
      const newFee = ethers.parseEther("0.002");
      await mememint.setGenerationFee(newFee);
      expect(await mememint.generationFee()).to.equal(newFee);
    });

    it("Should allow owner to set treasury", async function () {
      const newTreasury = await ethers.getContractFactory("Treasury");
      const treasury2 = await newTreasury.deploy();
      await treasury2.waitForDeployment();

      await mememint.setTreasury(await treasury2.getAddress());
      expect(await mememint.treasury()).to.equal(await treasury2.getAddress());
    });

    it("Should reject non-owner from admin functions", async function () {
      await expect(
        mememint.connect(user1).setGenerationFee(ethers.parseEther("0.002"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});