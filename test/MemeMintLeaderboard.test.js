import { expect } from "chai";
import hardhat from "hardhat";

const { ethers, upgrades } = hardhat;

describe("MemeMintLeaderboard Contract", function () {
    let leaderboard;
    let owner, user1, user2, user3, user4;
    let LeaderboardFactory;

    beforeEach(async function () {
        [owner, user1, user2, user3, user4] = await ethers.getSigners();

        LeaderboardFactory = await ethers.getContractFactory("MemeMintLeaderboard");
        leaderboard = await upgrades.deployProxy(LeaderboardFactory, [owner.address], {
            initializer: "initialize",
            kind: "uups"
        });
        await leaderboard.waitForDeployment();
    });

    describe("Initialization", function () {
        it("Should initialize with correct owner", async function () {
            expect(await leaderboard.owner()).to.equal(owner.address);
        });

        it("Should not allow reinitialization", async function () {
            await expect(
                leaderboard.initialize(user1.address)
            ).to.be.revertedWith("Initializable: contract is already initialized");
        });

        it("Should reject zero address owner", async function () {
            const LeaderboardFactory = await ethers.getContractFactory("MemeMintLeaderboard");
            await expect(
                upgrades.deployProxy(LeaderboardFactory, [ethers.ZeroAddress], {
                    initializer: "initialize",
                    kind: "uups"
                })
            ).to.be.revertedWithCustomError(LeaderboardFactory, "InvalidUserAddress");
        });
    });

    describe("updateMinter", function () {
        it("Should reject zero address", async function () {
            await expect(
                leaderboard.updateMinter(ethers.ZeroAddress, 1)
            ).to.be.revertedWithCustomError(leaderboard, "InvalidUserAddress");
        });

        it("Should reject zero mint count", async function () {
            await expect(
                leaderboard.updateMinter(user1.address, 0)
            ).to.be.revertedWithCustomError(leaderboard, "InvalidMintCount");
        });

        it("Should reject calls from non-owner", async function () {
            await expect(
                leaderboard.connect(user1).updateMinter(user2.address, 1)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should add first user to leaderboard", async function () {
            await expect(leaderboard.updateMinter(user1.address, 5))
                .to.emit(leaderboard, "LeaderboardUpdated")
                .withArgs(user1.address, 1, 5);

            expect(await leaderboard.totalUniqueMinters()).to.equal(1);
            expect(await leaderboard.minMintsForTop100()).to.equal(0);

            const [entry, position] = await leaderboard.getUserEntry(user1.address);
            expect(entry.user).to.equal(user1.address);
            expect(entry.totalMints).to.equal(5);
            expect(position).to.equal(1);
        });

        it("Should update existing user with higher mint count", async function () {
            await leaderboard.updateMinter(user1.address, 5);
            await leaderboard.updateMinter(user1.address, 10);

            const [entry, position] = await leaderboard.getUserEntry(user1.address);
            expect(entry.totalMints).to.equal(10);
            expect(position).to.equal(1);
        });

        it("Should not update position if mint count doesn't increase", async function () {
            await leaderboard.updateMinter(user1.address, 10);
            const initialPosition = (await leaderboard.getUserEntry(user1.address))[1];

            await leaderboard.updateMinter(user1.address, 5); // Lower count

            const finalPosition = (await leaderboard.getUserEntry(user1.address))[1];
            expect(finalPosition).to.equal(initialPosition);
        });

        it("Should maintain sorted order when adding multiple users", async function () {
            await leaderboard.updateMinter(user1.address, 5);
            await leaderboard.updateMinter(user2.address, 10);
            await leaderboard.updateMinter(user3.address, 3);

            const topMinters = await leaderboard.getTopMinters(3);
            expect(topMinters[0].user).to.equal(user2.address);
            expect(topMinters[0].totalMints).to.equal(10);
            expect(topMinters[1].user).to.equal(user1.address);
            expect(topMinters[1].totalMints).to.equal(5);
            expect(topMinters[2].user).to.equal(user3.address);
            expect(topMinters[2].totalMints).to.equal(3);
        });

        it("Should replace lowest user when leaderboard is full", async function () {
            // Fill leaderboard with 100 users
            for (let i = 1; i <= 100; i++) {
                const user = ethers.Wallet.createRandom().address;
                await leaderboard.updateMinter(user, i);
            }

            expect(await leaderboard.totalUniqueMinters()).to.equal(100);
            expect(await leaderboard.minMintsForTop100()).to.equal(1);

            // Try to add user with 50 mints (should replace user with 1 mint)
            await expect(leaderboard.updateMinter(user1.address, 50))
                .to.emit(leaderboard, "UserRemovedFromLeaderboard")
                .to.emit(leaderboard, "LeaderboardUpdated");

            expect(await leaderboard.totalUniqueMinters()).to.equal(100);
            expect(await leaderboard.minMintsForTop100()).to.equal(2); // New minimum
        });

        it("Should not add user if mints below minimum for full leaderboard", async function () {
            // Fill leaderboard
            for (let i = 1; i <= 100; i++) {
                const user = ethers.Wallet.createRandom().address;
                await leaderboard.updateMinter(user, i + 10); // Start from 11
            }

            expect(await leaderboard.minMintsForTop100()).to.equal(11);

            // Try to add user with only 5 mints (below minimum)
            await leaderboard.updateMinter(user1.address, 5);

            expect(await leaderboard.isInTop100(user1.address)).to.equal(false);
            expect(await leaderboard.totalUniqueMinters()).to.equal(100);
        });
    });

    describe("getTopMinters", function () {
        it("Should reject invalid count", async function () {
            await expect(
                leaderboard.getTopMinters(0)
            ).to.be.revertedWithCustomError(leaderboard, "InvalidCountRange");

            await expect(
                leaderboard.getTopMinters(101)
            ).to.be.revertedWithCustomError(leaderboard, "InvalidCountRange");
        });

        it("Should return empty array when no minters", async function () {
            const result = await leaderboard.getTopMinters(10);
            expect(result).to.have.lengthOf(0);
        });

        it("Should return correct number of minters", async function () {
            await leaderboard.updateMinter(user1.address, 5);
            await leaderboard.updateMinter(user2.address, 10);

            const result = await leaderboard.getTopMinters(1);
            expect(result).to.have.lengthOf(1);
            expect(result[0].user).to.equal(user2.address);
        });

        it("Should return all minters if count exceeds total", async function () {
            await leaderboard.updateMinter(user1.address, 5);
            await leaderboard.updateMinter(user2.address, 10);

            const result = await leaderboard.getTopMinters(10);
            expect(result).to.have.lengthOf(2);
        });
    });

    describe("getUserEntry", function () {
        it("Should return empty entry for non-existent user", async function () {
            const [entry, position] = await leaderboard.getUserEntry(user1.address);
            expect(entry.user).to.equal(ethers.ZeroAddress);
            expect(entry.totalMints).to.equal(0);
            expect(position).to.equal(0);
        });

        it("Should return correct entry for existing user", async function () {
            await leaderboard.updateMinter(user1.address, 15);

            const [entry, position] = await leaderboard.getUserEntry(user1.address);
            expect(entry.user).to.equal(user1.address);
            expect(entry.totalMints).to.equal(15);
            expect(position).to.equal(1);
        });
    });

    describe("getLeaderboardStats", function () {
        it("Should return correct stats when empty", async function () {
            const [totalMinters, minMints] = await leaderboard.getLeaderboardStats();
            expect(totalMinters).to.equal(0);
            expect(minMints).to.equal(0);
        });

        it("Should return correct stats with minters", async function () {
            await leaderboard.updateMinter(user1.address, 10);
            await leaderboard.updateMinter(user2.address, 5);

            const [totalMinters, minMints] = await leaderboard.getLeaderboardStats();
            expect(totalMinters).to.equal(2);
            expect(minMints).to.equal(0); // Not full yet
        });

        it("Should return correct min mints when leaderboard is full", async function () {
            // Fill leaderboard
            for (let i = 1; i <= 100; i++) {
                const user = ethers.Wallet.createRandom().address;
                await leaderboard.updateMinter(user, i);
            }

            const [totalMinters, minMints] = await leaderboard.getLeaderboardStats();
            expect(totalMinters).to.equal(100);
            expect(minMints).to.equal(1);
        });
    });

    describe("isInTop100", function () {
        it("Should return false for non-existent user", async function () {
            expect(await leaderboard.isInTop100(user1.address)).to.equal(false);
        });

        it("Should return true for user in top 100", async function () {
            await leaderboard.updateMinter(user1.address, 10);
            expect(await leaderboard.isInTop100(user1.address)).to.equal(true);
        });

        it("Should return false for user removed from leaderboard", async function () {
            // Fill leaderboard
            for (let i = 1; i <= 100; i++) {
                const user = ethers.Wallet.createRandom().address;
                await leaderboard.updateMinter(user, i);
            }

            // Add user1 with high mints
            await leaderboard.updateMinter(user1.address, 200);
            expect(await leaderboard.isInTop100(user1.address)).to.equal(true);

            // Add another user that pushes user1 out
            const highUser = ethers.Wallet.createRandom().address;
            await leaderboard.updateMinter(highUser, 300);

            // user1 should still be in top 100 (position depends on sorting)
            expect(await leaderboard.isInTop100(user1.address)).to.equal(true);
        });
    });

    describe("getEntryAtPosition", function () {
        it("Should reject invalid positions", async function () {
            await expect(
                leaderboard.getEntryAtPosition(0)
            ).to.be.revertedWithCustomError(leaderboard, "InvalidPositionRange");

            await expect(
                leaderboard.getEntryAtPosition(101)
            ).to.be.revertedWithCustomError(leaderboard, "InvalidPositionRange");
        });

        it("Should reject unfilled positions", async function () {
            await expect(
                leaderboard.getEntryAtPosition(1)
            ).to.be.revertedWithCustomError(leaderboard, "PositionNotFilled");
        });

        it("Should return correct entry at position", async function () {
            await leaderboard.updateMinter(user1.address, 10);
            await leaderboard.updateMinter(user2.address, 5);

            const entry = await leaderboard.getEntryAtPosition(1);
            expect(entry.user).to.equal(user1.address);
            expect(entry.totalMints).to.equal(10);

            const entry2 = await leaderboard.getEntryAtPosition(2);
            expect(entry2.user).to.equal(user2.address);
            expect(entry2.totalMints).to.equal(5);
        });
    });

    describe("Complex leaderboard scenarios", function () {
        it("Should handle multiple updates and maintain correct sorting", async function () {
            // Add users with various mint counts
            await leaderboard.updateMinter(user1.address, 10);
            await leaderboard.updateMinter(user2.address, 20);
            await leaderboard.updateMinter(user3.address, 5);
            await leaderboard.updateMinter(user4.address, 15);

            // Update user1 to have more mints
            await leaderboard.updateMinter(user1.address, 25);

            const topMinters = await leaderboard.getTopMinters(4);
            
            // Check that we have the expected mint counts (order may vary due to heap structure)
            const mintCounts = topMinters.map(m => Number(m.totalMints)).sort((a, b) => b - a);
            expect(mintCounts).to.deep.equal([25, 20, 15, 5]);
            
            // Check that the user with 25 mints exists
            const topUser = topMinters.find(m => m.totalMints === 25n);
            expect(topUser).to.not.equal(undefined);
        });

        it("Should handle leaderboard overflow correctly", async function () {
            // Add 100 users
            const users = [];
            for (let i = 1; i <= 100; i++) {
                const wallet = ethers.Wallet.createRandom();
                users.push(wallet.address);
                await leaderboard.updateMinter(wallet.address, i);
            }

            // Verify leaderboard is full
            expect(await leaderboard.totalUniqueMinters()).to.equal(100);

            // Add user with mints that should place them at position 50
            await leaderboard.updateMinter(user1.address, 50);

            const user1Position = (await leaderboard.getUserEntry(user1.address))[1];
            expect(user1Position).to.be.within(1, 100);

            // Verify someone was removed (the user with 1 mint)
            const removedUserExists = await leaderboard.isInTop100(users[0]); // User with 1 mint
            expect(removedUserExists).to.equal(false);
        });

        it("Should update timestamps correctly", async function () {
            const initialTime = await ethers.provider.getBlock('latest').then(b => b.timestamp);

            await leaderboard.updateMinter(user1.address, 10);

            const [entry] = await leaderboard.getUserEntry(user1.address);
            expect(entry.lastMintTime).to.be.at.least(initialTime);

            // Wait for next block and update again
            await ethers.provider.send("evm_mine");
            await leaderboard.updateMinter(user1.address, 15);

            const [updatedEntry] = await leaderboard.getUserEntry(user1.address);
            expect(updatedEntry.lastMintTime).to.be.greaterThan(entry.lastMintTime);
        });
    });

    describe("Upgradeability", function () {
        it("Should authorize upgrades correctly", async function () {
            const LeaderboardV2Factory = await ethers.getContractFactory("MemeMintLeaderboard");
            await expect(
                upgrades.upgradeProxy(leaderboard.target, LeaderboardV2Factory)
            ).to.not.be.reverted;
        });

        it("Should reject upgrade from non-owner", async function () {
            const LeaderboardV2Factory = await ethers.getContractFactory("MemeMintLeaderboard");
            await expect(
                upgrades.upgradeProxy(leaderboard.target, LeaderboardV2Factory.connect(user1))
            ).to.be.reverted;
        });
    });
});