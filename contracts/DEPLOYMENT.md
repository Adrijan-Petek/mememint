Deployment checklist for MemeMint (UUPS proxy pattern)

Overview
--------
MemeMint is an upgradeable UUPS implementation contract. The implementation contract's constructor disables initializers to prevent direct initialization. You must initialize the proxy, not the implementation.

Steps
-----
1. Build/compile the contracts and obtain the implementation bytecode and ABI.
2. Deploy the `MemeMint` implementation contract (this contract's constructor will call `_disableInitializers()`).
3. Deploy a UUPS proxy that points to the implementation contract (e.g., OpenZeppelin ProxyAdmin + UUPS proxy or a minimal UUPS proxy).
4. Immediately call `initialize(initialOwner, initialMintFee)` on the proxy (NOT the implementation). This will:
   - Initialize parent contracts (Ownable2Step, UUPS, ReentrancyGuard, Pausable)
   - Set the contract owner
   - Set `totalMints` and `totalRevenue` to non-zero sentinel values
   - Set the initial mint fee
5. Verify ownership and initial state via `owner()` and `mintFee()`.
6. When upgrading, ensure the caller is the owner and use the UUPS upgrade flow (`upgradeTo`) through the proxy.

Security notes
--------------
- Do not send ETH to the implementation contract. It is not used and may be locked.
- Ensure `initialize` is only called on the proxy and only once.
- Keep your proxy admin keys secure.
