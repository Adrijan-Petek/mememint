export const CONTRACT_ADDRESSES = {
  mememint: '0x86A43ae089BCD2a0F95542682e513175612BB9C3', // ✅ Updated Mememint contract with fixed ETH transfer
  treasury: '0x4458bFdd688Df499Bc01e4E5890d0e9aA8aFa857', // ✅ Deployed Treasury contract
  token: (process.env.NEXT_PUBLIC_MEMEMINT_TOKEN_ADDRESS as string) || '0x051366F5154f24e5E2980A3Ff4B3096Ff032Ab07',
} as const;