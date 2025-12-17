const { expect } = require("chai");
const { ethers: hardhatEthers } = require("hardhat");
const ethers = require("ethers");

describe("MememintERC1155", function () {
  let MememintERC1155, erc1155, owner, user, treasury;

  beforeEach(async function () {
    [owner, user, treasury] = await hardhatEthers.getSigners();
    MememintERC1155 = await hardhatEthers.getContractFactory("MememintERC1155");
    erc1155 = await MememintERC1155.deploy(treasury.address);
    await erc1155.waitForDeployment();
  });

  it("Should deploy with correct treasury", async function () {
    expect(await erc1155.treasury()).to.equal(treasury.address);
  });

  it("Should allow owner to create a drop", async function () {
    await erc1155.createDrop(1, hardhatEthers.parseEther("0.1"), 100, "ipfs://test");
    const drop = await erc1155.drops(1);
    expect(drop.exists).to.be.true;
    expect(drop.priceWei).to.equal(hardhatEthers.parseEther("0.1"));
    expect(drop.supply).to.equal(100);
    expect(drop.uri).to.equal("ipfs://test");
  });

  it("Should not allow non-owner to create drop", async function () {
    await expect(erc1155.connect(user).createDrop(1, hardhatEthers.parseEther("0.1"), 100, "ipfs://test")).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should return correct URI", async function () {
    await erc1155.createDrop(1, hardhatEthers.parseEther("0.1"), 100, "ipfs://test");
    expect(await erc1155.uri(1)).to.equal("ipfs://test");
  });

  it("Should allow minting", async function () {
    await erc1155.createDrop(1, hardhatEthers.parseEther("0.1"), 100, "ipfs://test");
    await erc1155.connect(user).mint(1, 1, { value: hardhatEthers.parseEther("0.1") });
    expect(await erc1155.balanceOf(user.address, 1)).to.equal(1);
    expect((await erc1155.drops(1)).minted).to.equal(1);
  });

  it("Should forward ETH to treasury", async function () {
    await erc1155.createDrop(1, hardhatEthers.parseEther("0.1"), 100, "ipfs://test");
    const initialBalance = await hardhatEthers.provider.getBalance(treasury.address);
    await erc1155.connect(user).mint(1, 1, { value: hardhatEthers.parseEther("0.1") });
    expect(await hardhatEthers.provider.getBalance(treasury.address)).to.equal(initialBalance + hardhatEthers.parseEther("0.1"));
  });

  it("Should not mint if insufficient ETH", async function () {
    await erc1155.createDrop(1, hardhatEthers.parseEther("0.1"), 100, "ipfs://test");
    await expect(erc1155.connect(user).mint(1, 1, { value: hardhatEthers.parseEther("0.05") })).to.be.revertedWith("insufficient ETH");
  });

  it("Should not mint if sold out", async function () {
    await erc1155.createDrop(1, hardhatEthers.parseEther("0.1"), 1, "ipfs://test");
    await erc1155.connect(user).mint(1, 1, { value: hardhatEthers.parseEther("0.1") });
    await expect(erc1155.connect(user).mint(1, 1, { value: hardhatEthers.parseEther("0.1") })).to.be.revertedWith("sold out");
  });

  it("Should pause and unpause", async function () {
    await erc1155.createDrop(1, hardhatEthers.parseEther("0.1"), 100, "ipfs://test");
    await erc1155.pause();
    await expect(erc1155.connect(user).mint(1, 1, { value: hardhatEthers.parseEther("0.1") })).to.be.revertedWith("Pausable: paused");
    await erc1155.unpause();
    await erc1155.connect(user).mint(1, 1, { value: hardhatEthers.parseEther("0.1") });
    expect(await erc1155.balanceOf(user.address, 1)).to.equal(1);
  });

  it("Should get drop details", async function () {
    await erc1155.createDrop(1, hardhatEthers.parseEther("0.1"), 100, "ipfs://test");
    const [price, supply, minted, uri] = await erc1155.getDrop(1);
    expect(price).to.equal(hardhatEthers.parseEther("0.1"));
    expect(supply).to.equal(100);
    expect(minted).to.equal(0);
    expect(uri).to.equal("ipfs://test");
  });

  it("Should get remaining supply", async function () {
    await erc1155.createDrop(1, hardhatEthers.parseEther("0.1"), 100, "ipfs://test");
    expect(await erc1155.getRemainingSupply(1)).to.equal(100);
    await erc1155.connect(user).mint(1, 10, { value: hardhatEthers.parseEther("1") });
    expect(await erc1155.getRemainingSupply(1)).to.equal(90);
  });
});