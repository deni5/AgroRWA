# Deployment Guide

## Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.30.1
avm use 0.30.1

# Verify
solana --version    # 1.18.x
anchor --version    # 0.30.1
node --version      # 20.x
```

## Step 1 — Configure Solana CLI

```bash
# Set to devnet
solana config set --url devnet

# Create or use existing keypair
solana-keygen new --outfile ~/.config/solana/id.json

# Get devnet SOL (needed for deployment fees)
solana airdrop 4
solana balance
```

## Step 2 — Build programs

```bash
# From project root
anchor build

# This generates:
# - target/deploy/*.so  (compiled programs)
# - target/idl/*.json   (IDL files)
# - target/types/*.ts   (TypeScript types)
```

## Step 3 — Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

Copy the printed program IDs — you'll need them for the frontend.

Example output:
```
Deploying workspace: https://api.devnet.solana.com
Upgrade authority: ~/.config/solana/id.json
Deploying program "agro_registry"...
Program Id: <REGISTRY_PROGRAM_ID>

Deploying program "liquidity_pool"...
Program Id: <POOL_PROGRAM_ID>

Deploying program "vault"...
Program Id: <VAULT_PROGRAM_ID>
```

## Step 4 — Update program IDs

Update `Anchor.toml` with the real program IDs:
```toml
[programs.devnet]
agro_registry = "<REGISTRY_PROGRAM_ID>"
liquidity_pool = "<POOL_PROGRAM_ID>"
vault = "<VAULT_PROGRAM_ID>"
```

Also update each `declare_id!()` in the program `lib.rs` files, then rebuild:
```bash
anchor build
anchor deploy --provider.cluster devnet
```

## Step 5 — Copy IDL files

```bash
cp target/idl/agro_registry.json apps/web/src/lib/idl/
cp target/idl/liquidity_pool.json apps/web/src/lib/idl/
cp target/idl/vault.json apps/web/src/lib/idl/
```

## Step 6 — Configure frontend

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:
```env
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_REGISTRY_PROGRAM_ID=<REGISTRY_PROGRAM_ID>
NEXT_PUBLIC_POOL_PROGRAM_ID=<POOL_PROGRAM_ID>
NEXT_PUBLIC_VAULT_PROGRAM_ID=<VAULT_PROGRAM_ID>
```

## Step 7 — Start frontend

```bash
cd apps/web
npm install
npm run dev
# Open http://localhost:3000
```

## Step 8 — Run tests

```bash
# Anchor tests (requires local validator or devnet)
anchor test

# Or against devnet
anchor test --provider.cluster devnet
```

---

## Mainnet Deployment (after audit)

1. Switch config: `solana config set --url mainnet-beta`
2. Update `Anchor.toml` cluster to `mainnet-beta`
3. Fund deployer wallet with real SOL (~3–5 SOL for all programs)
4. `anchor deploy --provider.cluster mainnet-beta`
5. Update `.env.local` with `NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com`
