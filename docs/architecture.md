# AgroRWA — Architecture

## Overview

```
┌─────────────────────────────────────────────────────┐
│              Frontend (Next.js 14)                   │
│  Pages: tokens, market, swap, vault, portfolio       │
│  Wallet: Phantom, Solflare, Backpack                 │
│  State: TanStack Query + Zustand                     │
└────────────────────┬────────────────────────────────┘
                     │ @solana/wallet-adapter
                     │ @coral-xyz/anchor
                     ▼
┌─────────────────────────────────────────────────────┐
│           Solana Programs (Anchor / Rust)            │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ agro_registry│  │liquidity_pool│  │  vault    │  │
│  │              │  │              │  │           │  │
│  │ register_tok │  │ create_pool  │  │deposit_lp │  │
│  │ update_token │  │ add_liquidity│  │redeem_lp  │  │
│  │              │  │ remove_liq   │  │           │  │
│  │              │  │ swap         │  │           │  │
│  └──────────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              Solana Blockchain                       │
│  SPL Tokens · PDAs · ATAs · Devnet → Mainnet-Beta   │
└─────────────────────────────────────────────────────┘
```

## Key Design Decisions

### PDAs (Program Derived Addresses)

Every piece of on-chain state is stored in PDAs for deterministic derivation:

| Account | Seeds | Program |
|---------|-------|---------|
| `AgroAsset` | `["agro_asset", mint]` | agro_registry |
| `Pool` | `["pool", mintA, mintB]` | liquidity_pool |
| `VaultA` | `["vault_a", pool]` | liquidity_pool |
| `VaultB` | `["vault_b", pool]` | liquidity_pool |
| `LpMint` | `["lp_mint", pool]` | liquidity_pool |
| `VaultDeposit` | `["vault_deposit", user, lpMint]` | vault |
| `ReceiptMint` | `["receipt_mint", lpMint]` | vault |

### AMM Formula

Constant product market maker: `x * y = k`

```
amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee)
amountInWithFee = amountIn * (10000 - feeBps) / 10000
price = reserveB / reserveA
```

### Pool Token Ordering

Token mints are sorted by pubkey (`mintA < mintB`) to ensure each pair maps to exactly one PDA regardless of input order.

### LP Token Minting

- First deposit: `LP = sqrt(amountA * amountB)` (geometric mean)
- Subsequent deposits: `LP = min(amountA * supply / reserveA, amountB * supply / reserveB)`

## Data Flow

### Token Registration
1. Creator holds SPL token mint (created separately via Solana CLI or Metaplex)
2. Calls `register_token` with metadata → creates `AgroAsset` PDA
3. Frontend reads all `AgroAsset` PDAs via `getProgramAccounts`

### Swap
1. User selects pool and input amount
2. Frontend calculates quote via AMM formula
3. User signs → `swap` instruction executes CPI token transfers
4. Pool reserves updated on-chain

### Vault Lock
1. User selects LP token and amount
2. `deposit_lp` → transfers LP to vault, mints receipt tokens 1:1
3. `VaultDeposit` PDA stores unlock timestamp (now + 30 days)
4. After 30 days: `redeem_lp` → burns receipt, returns LP tokens
