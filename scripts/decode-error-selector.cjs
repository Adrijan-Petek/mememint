const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Decoding error selector: 0x72cdf377\n");

    // List of possible errors from IMemeMintErrors
    const errors = [
        "InvalidMintFee()",
        "InsufficientPayment()",
        "RefundFailed()",
        "InvalidFunctionCall()",
        "NoFundsToWithdraw()",
        "WithdrawFailed()",
        "InvalidImplementation()",
        "ZeroAddress()",
        "InitializationFailed()",
        "RateLimitExceeded()",
        "InvalidLeaderboardAddress()",
        "InvalidUserAddress()",
        "InvalidMintCount()",
        "InvalidCountRange()",
        "InvalidPositionRange()"
    ];

    const targetSelector = "0x72cdf377";

    for (const errorSig of errors) {
        const selector = ethers.id(errorSig).substring(0, 10);
        const match = selector.toLowerCase() === targetSelector.toLowerCase();
        
        console.log(`${match ? "✅" : "  "} ${errorSig.padEnd(30)} => ${selector}`);
        
        if (match) {
            console.log(`\n🎯 MATCH FOUND: ${errorSig}`);
            console.log(`📋 This error is thrown when: The function called doesn't exist or invalid call`);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });