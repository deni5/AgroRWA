# AgroRWA

Decentralized platform for tokenizing agricultural real-world assets (RWA) on Solana.

## Concept

AgroRWA enables farmers and agro-traders to tokenize agricultural assets and raise financing through a transparent, oracle-verified marketplace. Investors can purchase tokens backed by real assets with full due diligence on-chain.

## Token Types

| Type | Description | Pricing |
|------|-------------|---------|
| **FORWARD** | Future harvest rights | Pyth spot × discount |
| **ASSET** | Equipment / commodity / land | Oracle appraisal |
| **CREDIT** | Project financing bond 10-25% APY | PV of coupons |
| **REVENUE** | Farm revenue share | PV of expected income |

## Architecture

### 5 Anchor Programs

| Program | Responsibility |
|---------|----------------|
| `identity` | KYC emitters, register oracles, manage ratings |
| `asset_registry` | Mint tokens, store asset metadata, docs NFT |
| `oracle_verify` | Oracle signatures, reputation, lifecycle |
| `marketplace` | Listings, escrow, order fill, bids |
| `insurance` | Fee collection, claims, oracle staking |

### Economic Model (per 100 USDC trade)
- Emitter receives: **98.5 USDC**
- Insurance fund: **0.5 USDC**
- Platform ops: **0.5 USDC**
- Oracle fees: **0.5 USDC** (80% to oracles, 20% to insurance)

### Emitter Rating → Deposit Required
- AAA (900+): 2% deposit
- AA (700-899): 5% deposit
- A (500-699): 8% deposit
- B (300-499): 12% deposit
- C (<300): 20% deposit

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Programs | Rust, Anchor 0.30.1 |
| Frontend | Next.js 14, TypeScript, TailwindCSS |
| Wallet | @solana/wallet-adapter (Phantom, Solflare, Backpack) |
| Price Oracle | Pyth Network (Wheat, Corn, Sunflower, SOL, USDC) |
| Docs Storage | IPFS / Arweave |
| NFT | Metaplex |
| Network | Solana Devnet → Mainnet-beta |

## Quick Start

```bash
# 1. Install dependencies
npm install && cd apps/web && npm install

# 2. Build programs
anchor build

# 3. Deploy to devnet
anchor deploy --provider.cluster devnet

# 4. Copy IDLs
cp target/idl/*.json apps/web/src/lib/idl/

# 5. Configure env
cp apps/web/.env.example apps/web/.env.local
# Fill in program IDs from deploy output

# 6. Start frontend
cd apps/web && npm run dev
```

## Project Structure

```
AgroRWA/
├── programs/
│   ├── identity/          # KYC + Oracle registry
│   ├── asset_registry/    # Token mint + metadata
│   ├── oracle_verify/     # Signatures + reputation
│   ├── marketplace/       # Orders + escrow
│   └── insurance/         # Fund + claims
├── apps/web/              # Next.js 14 frontend
├── tests/                 # Anchor integration tests
├── idl/                   # Generated IDL files
├── scripts/               # Deploy scripts
└── docs/                  # Documentation
```

## Docs
- [Architecture](docs/architecture.md)
- [Programs](docs/programs.md)
- [Token Types](docs/tokens.md)
- [Deployment](docs/deployment.md)
