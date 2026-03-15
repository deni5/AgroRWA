# User Flow

## Farmer: Tokenize a Harvest

```
1. Create SPL token mint
   solana-keygen new -o wheat-mint.json
   spl-token create-token --decimals 6

2. Open AgroRWA → /register-token
   - Paste mint address
   - Fill title, description, category
   - Click "Register Asset"
   → AgroAsset PDA created on-chain

3. Create liquidity pool → /create-pool
   - Enter wheat mint + USDC mint
   - Click "Create Pool"
   → Pool PDA + vaults + LP mint initialized

4. Seed initial liquidity → /add-liquidity
   - Select pool
   - Enter token amounts
   - Click "Add Liquidity"
   → LP tokens received
```

## Investor: Buy Harvest Tokens

```
1. Open /market or /tokens
   - Browse registered agricultural assets
   - Check prices, liquidity, reserves

2. Swap → /swap
   - Select pool (e.g. WHEAT/USDC)
   - Enter USDC amount
   - Review quote, price impact, fee
   - Click "Swap"
   → Receive WHEAT tokens

3. Lock LP for rewards → /vault
   - If you added liquidity, deposit LP tokens
   - Tokens locked 30 days
   - Receive receipt tokens
   - After 30 days: redeem LP
```

## Admin / Creator: Manage Asset

```
1. Update metadata → /token/[mint]
   - Click "Edit" (visible only to creator)
   - Update description or logo
   → update_token instruction

2. Monitor pool
   - /market shows live reserves and price
   - All data read from on-chain PDAs
```

## Transaction States

Every transaction shows one of:
- **Pending** — transaction submitted, awaiting confirmation
- **Success** — confirmed, with Solana Explorer link
- **Error** — failed, with error message

## Network

All transactions target **Solana Devnet**. Phantom wallet will prompt to switch if you're on a different network.

Get devnet SOL: https://faucet.solana.com
