import { expect } from "chai";
import hardhat from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const { ethers, upgrades } = hardhat;

describe("MemeMint Contract", function () {
  let MemeMint;
  let memeMint;
  let owner, user1, user2;
  let initialMintFee;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy contract
    MemeMint = await ethers.getContractFactory("MemeMint");
    initialMintFee = ethers.parseEther("0.000017"); // 0.000017 ETH

    memeMint = await upgrades.deployProxy(
      MemeMint,
      [owner.address, initialMintFee],
      {
        initializer: 'initialize',
        kind: 'uups'
      }
    );

    await memeMint.waitForDeployment();
  });

  describe("Initialization", function () {
    it("Should initialize with correct parameters", async function () {
      expect(await memeMint.owner()).to.equal(owner.address);
      expect(await memeMint.mintFee()).to.equal(initialMintFee);
      expect(await memeMint.totalMints()).to.equal(1);
      expect(await memeMint.totalRevenue()).to.equal(1);
    });

    it("Should not allow reinitialization", async function () {
      await expect(
        memeMint.initialize(owner.address, initialMintFee)
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });

    it("Should reject zero address owner", async function () {
      const MemeMintNew = await ethers.getContractFactory("MemeMint");
      await expect(
        upgrades.deployProxy(
          MemeMintNew,
          [ethers.ZeroAddress, initialMintFee],
          { initializer: 'initialize', kind: 'uups' }
        )
      ).to.be.revertedWithCustomError(MemeMintNew, "ZeroAddress");
    });

    it("Should reject invalid mint fee", async function () {
      const MemeMintNew = await ethers.getContractFactory("MemeMint");
      const invalidFee = ethers.parseEther("0.2"); // Above MAX_MINT_FEE (0.1 ether)
      await expect(
        upgrades.deployProxy(
          MemeMintNew,
          [owner.address, invalidFee],
          { initializer: 'initialize', kind: 'uups' }
        )
      ).to.be.revertedWithCustomError(MemeMintNew, "InvalidMintFee");
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership correctly", async function () {
      await memeMint.transferOwnership(user1.address);
      expect(await memeMint.owner()).to.equal(owner.address); // Still owner until accepted

      await memeMint.connect(user1).acceptOwnership();
      expect(await memeMint.owner()).to.equal(user1.address);
    });

    it("Should reject unauthorized ownership transfer", async function () {
      await expect(
        memeMint.connect(user1).transferOwnership(user2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Minting", function () {
    it("Should mint successfully with exact fee", async function () {
      const initialBalance = await ethers.provider.getBalance(memeMint.target);
      const initialMints = await memeMint.getActualMintCount();
      const initialRevenue = await memeMint.getActualRevenue();

      await memeMint.connect(user1).mintMeme({ value: initialMintFee });

      expect(await memeMint.getActualMintCount()).to.equal(initialMints + 1n);
      expect(await memeMint.getActualRevenue()).to.equal(initialRevenue + initialMintFee);
      expect(await ethers.provider.getBalance(memeMint.target)).to.equal(initialBalance + initialMintFee);
    });

    it("Should mint and refund excess payment", async function () {
      const excessAmount = ethers.parseEther("0.001");
      const totalPayment = initialMintFee + excessAmount;

      const initialUserBalance = await ethers.provider.getBalance(user1.address);

      const tx = await memeMint.connect(user1).mintMeme({ value: totalPayment });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalUserBalance = await ethers.provider.getBalance(user1.address);
      const expectedBalance = initialUserBalance - totalPayment - gasUsed + excessAmount;

      expect(finalUserBalance).to.equal(expectedBalance);
      expect(await ethers.provider.getBalance(memeMint.target)).to.equal(initialMintFee);
    });

    it("Should reject insufficient payment", async function () {
      const insufficientFee = initialMintFee - 1n;
      await expect(
        memeMint.connect(user1).mintMeme({ value: insufficientFee })
      ).to.be.revertedWithCustomError(memeMint, "InsufficientPayment");
    });

    it("Should enforce rate limiting", async function () {
      // Mint maximum allowed times per day
      for (let i = 0; i < 80; i++) {
        await memeMint.connect(user1).mintMeme({ value: initialMintFee });
      }

      // Next mint should fail
      await expect(
        memeMint.connect(user1).mintMeme({ value: initialMintFee })
      ).to.be.revertedWithCustomError(memeMint, "RateLimitExceeded");
    });

    it("Should allow minting after rate limit reset (next day)", async function () {
      // Mint maximum times
      for (let i = 0; i < 80; i++) {
        await memeMint.connect(user1).mintMeme({ value: initialMintFee });
      }

      // Advance time by 1 day
      await time.increase(86400);

      // Should be able to mint again
      await expect(
        memeMint.connect(user1).mintMeme({ value: initialMintFee })
      ).to.not.be.reverted;
    });

    it("Should not mint when paused", async function () {
      await memeMint.pause();
      await expect(
        memeMint.connect(user1).mintMeme({ value: initialMintFee })
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Fee Management", function () {
    it("Should update mint fee correctly", async function () {
      const newFee = ethers.parseEther("0.000044");
      await memeMint.setMintFee(newFee);
      expect(await memeMint.mintFee()).to.equal(newFee);
    });

    it("Should reject fee update from non-owner", async function () {
      const newFee = ethers.parseEther("0.000044");
      await expect(
        memeMint.connect(user1).setMintFee(newFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should reject invalid fee values", async function () {
      const invalidFeeLow = ethers.parseEther("0.000001"); // Below MIN_MINT_FEE (0.00001 ether)
      const invalidFeeHigh = ethers.parseEther("0.2"); // Above MAX_MINT_FEE (0.1 ether)

      await expect(
        memeMint.setMintFee(invalidFeeLow)
      ).to.be.revertedWithCustomError(memeMint, "InvalidMintFee");

      await expect(
        memeMint.setMintFee(invalidFeeHigh)
      ).to.be.revertedWithCustomError(memeMint, "InvalidMintFee");
    });

    it("Should not emit event if fee unchanged", async function () {
      await expect(
        memeMint.setMintFee(initialMintFee)
      ).to.not.emit(memeMint, "MintFeeUpdated");
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      // Add some funds to contract
      await memeMint.connect(user1).mintMeme({ value: initialMintFee });
      await memeMint.connect(user2).mintMeme({ value: initialMintFee });
    });

    it("Should withdraw all funds to owner", async function () {
      const contractBalance = await ethers.provider.getBalance(memeMint.target);
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

      const tx = await memeMint.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance + contractBalance - gasUsed);
      expect(await ethers.provider.getBalance(memeMint.target)).to.equal(0);
    });

    it("Should reject withdrawal from non-owner", async function () {
      await expect(
        memeMint.connect(user1).withdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should reject withdrawal when no funds", async function () {
      // Withdraw all funds first
      await memeMint.withdraw();

      await expect(
        memeMint.withdraw()
      ).to.be.revertedWithCustomError(memeMint, "NoFundsToWithdraw");
    });
  });

  describe("Emergency Withdrawal", function () {
    beforeEach(async function () {
      await memeMint.connect(user1).mintMeme({ value: initialMintFee });
    });

    it("Should emergency withdraw funds", async function () {
      const contractBalance = await ethers.provider.getBalance(memeMint.target);
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

      const tx = await memeMint.emergencyWithdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance + contractBalance - gasUsed);
    });

    it("Should reject emergency withdrawal from non-owner", async function () {
      await expect(
        memeMint.connect(user1).emergencyWithdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Pause/Unpause", function () {
    it("Should pause and unpause correctly", async function () {
      await memeMint.pause();
      expect(await memeMint.paused()).to.be.true;

      await memeMint.unpause();
      expect(await memeMint.paused()).to.be.false;
    });

    it("Should reject pause from non-owner", async function () {
      await expect(
        memeMint.connect(user1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should reject unpause from non-owner", async function () {
      await memeMint.pause();
      await expect(
        memeMint.connect(user1).unpause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await memeMint.connect(user1).mintMeme({ value: initialMintFee });
      await memeMint.connect(user2).mintMeme({ value: initialMintFee });
    });

    it("Should return correct balance", async function () {
      expect(await memeMint.getBalance()).to.equal(initialMintFee * 2n);
    });

    it("Should return correct user mints per day", async function () {
      const latestBlock = await ethers.provider.getBlock('latest');
      const today = Math.floor(latestBlock.timestamp / 86400);
      expect(await memeMint.getUserMintsPerDay(user1.address, today)).to.equal(1);
      expect(await memeMint.getUserMintsToday(user1.address)).to.equal(1);
    });

    it("Should return correct stats", async function () {
      const stats = await memeMint.getStats();
      expect(stats.mints).to.equal(2);
      expect(stats.revenue).to.equal(initialMintFee * 2n);
      expect(stats.fee).to.equal(initialMintFee);
      expect(stats.balance).to.equal(initialMintFee * 2n);
    });

    it("Should return correct actual counts", async function () {
      expect(await memeMint.getActualMintCount()).to.equal(2);
      expect(await memeMint.getActualRevenue()).to.equal(initialMintFee * 2n);
    });
  });

  describe("Security", function () {
    it("Should reject direct ETH transfers from non-owner", async function () {
      await expect(
        user1.sendTransaction({
          to: memeMint.target,
          value: ethers.parseEther("1")
        })
      ).to.be.revertedWithCustomError(memeMint, "InvalidFunctionCall");
    });

    it("Should accept ETH from owner", async function () {
      const initialBalance = await ethers.provider.getBalance(memeMint.target);
      await owner.sendTransaction({
        to: memeMint.target,
        value: ethers.parseEther("1")
      });
      expect(await ethers.provider.getBalance(memeMint.target)).to.equal(initialBalance + ethers.parseEther("1"));
    });

    it("Should reject fallback calls", async function () {
      await expect(
        user1.sendTransaction({
          to: memeMint.target,
          value: 0,
          data: "0x12345678"
        })
      ).to.be.revertedWithCustomError(memeMint, "InvalidFunctionCall");
    });
  });

  describe("Upgradeability", function () {
    it("Should authorize upgrades correctly", async function () {
      const MemeMintV2 = await ethers.getContractFactory("MemeMint");
      await expect(
        upgrades.upgradeProxy(memeMint.target, MemeMintV2)
      ).to.not.be.reverted;
    });

    it("Should reject upgrade from non-owner", async function () {
      const MemeMintV2 = await ethers.getContractFactory("MemeMint");
      await expect(
        upgrades.upgradeProxy(memeMint.target, MemeMintV2.connect(user1))
      ).to.be.reverted;
    });
  });
});