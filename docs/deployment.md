# Deployment Guide

## Prerequisites
- Rust + Solana CLI 1.18+
- Anchor CLI 0.30.1
- Node.js 20+
- Wallet: `FWm4MDuTMWKJwdawF3VtUqWuZNi4Jq7TdJYWPnU5Yt8d`

## Step 1 — Configure wallet

```bash
# Set your wallet keypair path in Anchor.toml
# [provider]
# wallet = "/path/to/FWm4MD...keypair.json"

solana config set --url devnet
solana airdrop 4   # get devnet SOL
```

## Step 2 — Build programs

```bash
anchor build
```

## Step 3 — Get program IDs

```bash
anchor keys list
```

Output example:
```
identity:       Abc123...
asset_registry: Def456...
oracle_verify:  Ghi789...
marketplace:    Jkl012...
insurance:      Mno345...
```

## Step 4 — Update program IDs

Update in `Anchor.toml` and in each `programs/*/src/lib.rs` `declare_id!()`.

Then rebuild:
```bash
anchor build
```

## Step 5 — Deploy

```bash
anchor deploy --provider.cluster devnet
```

## Step 6 — Copy IDL files

```bash
npm run copy:idl
# or manually: cp target/idl/*.json apps/web/src/lib/idl/
```

## Step 7 — Configure frontend

```bash
cp apps/web/.env.example apps/web/.env.local
# Fill in program IDs from step 3
```

## Step 8 — Initialize insurance fund

```bash
# Run initialization script
npx ts-node scripts/init-insurance-fund.ts
```

## Step 9 — Start frontend

```bash
cd apps/web && npm install && npm run dev
```

Open http://localhost:3000
