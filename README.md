# Mememint (v1.2.0)

Mememint is a Farcaster Mini App for creating memes, tracking leaderboard points, and minting NFTs on Base.

## What’s New / Upgrades (v1.2.0)

- Light/Dark theme toggle (persisted) and updated global theme tokens.
- Redesigned splash screen to match the new theme.
- Shared app header across pages (wallet + theme toggle).
- Mobile-first Meme Creator UI: snap-scrolling template picker, bottom-sheet tools, and a sticky “Generate” action bar with safe-area padding.
- NFT mint previews use a static public image for reliable rendering.
- Dependency resolution improvements for CI/Vercel (see `.npmrc` note below).

## Recent UI Updates

- Polished MEMEMINT token page layout, contract display, and swap UI.
- Added on-chain rewards panel to the profile with per-token claim cards.
- Expanded achievement cards with game, meme, NFT, and leaderboard milestones.
- Custom wallet connect modal with explicit options: Farcaster, External, Base (Coinbase), and WalletConnect.
- Wallet options now show brand icons/logos.
- Added an Info (`i`) button in the header with a centered, scrollable modal.
- Info modal content is streamlined to focus on what the app is, the game, minting, and contracts.
- Dark theme palette is now deeper/darker with reduced glow intensity.
- Token page now includes a Staking panel marked "Coming Soon".

## Deployments

| Component | Network | Address / URL |
|---|---|---|
| Main contract | Base | `0x74272c4ed63662df64457BCac4e259C338Ef85C0` |
| Leaderboard contract | Base | `0xF4C22c98E07804Fd5602893f6125ce94055bB491` |
| NFT drops contract | Base | `0xB864e9BD48eCfAB4e320aCd448EBa3E10F5690d6` |
| Treasury contract | Base | `0x4458bFdd688Df499Bc01e4E5890d0e9aA8aFa857` |
| MemeBlastFees contract | Base | `0xda132daeD9D422b7A04978b4060F5bD4E27EcaF6` |
| Frontend | Vercel | `https://mememint-one.vercel.app` |

## Requirements

- Node.js `24.x` (required by this project setup)
- npm

## Install

```bash
npm install
```

Note: this repo ships with `.npmrc` using `legacy-peer-deps=true` to avoid peer-resolution failures in CI/Vercel with the current dependency set.

## Environment

Create `.env.local`:

```env
# Nile Postgres / Nile API
NILEDB_API_URL=
NILEDB_POSTGRES_URL=
DATABASE_URL=

# RPCs / keys (optional depending on features)
BASE_MAINNET_RPC=
BASESCAN_API_KEY=
PRIVATE_KEY=

# Optional: production host fallback
NEXT_PUBLIC_URL=https://your-domain.com
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Contracts & Tests

```bash
npm test
```

## NFT Preview Image

The app uses a static preview image served from `public/`:

- `public/uploads/the-emerald-degenerate.png`

It should be available at:

- `/uploads/the-emerald-degenerate.png`

## Theme

- Header actions are ordered: Info, Theme toggle, Wallet.
- Theme is stored in `localStorage` under `mememint:theme` and applied early to avoid flashing.
- Default theme is dark.
- Dark mode has been tuned darker via the `--mm-*` tokens in `app/globals.css`.

## Security / Audits

```bash
npm audit
```

## Notes

- `npm audit fix` may introduce breaking changes; review and test before deploying.
