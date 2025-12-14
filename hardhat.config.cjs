require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
    // Base Mainnet - use MAINNET_PRIVATE_KEY for production
    base: {
      url: process.env.BASE_MAINNET_RPC || "https://mainnet.base.org",
      chainId: 8453,
      accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
      gasPrice: "auto", // Auto-determine gas price
      timeout: 120000, // 2 minute timeout
    }
  },
  etherscan: {
    apiKey: process.env.BASESCAN_API_KEY || "",
  },
  sourcify: {
    enabled: false
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 20,
    showTimeSpent: true,
  },
};