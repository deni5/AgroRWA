# AgroRWA

Decentralized platform for tokenizing agricultural real-world assets (RWA) on Solana. Farmers issue SPL tokens backed by crops or future harvests. Investors trade verified tokens through a DEX with liquidity pools and vault locking.

> **Network: Solana Devnet** → mainnet-beta after audit

## What is AgroRWA?

AgroRWA is a DEX + RWA Registry for agricultural assets. It allows:

- **Register** agricultural assets on-chain (farmland, grain, livestock, harvest futures)
- **Create SPL tokens** representing real-world agricultural production  
- **Create liquidity pools** (AgroToken/SOL, AgroToken/USDC, AgroToken/AgroToken)
- **Trade tokens** via built-in swap UI
- **Lock LP positions** in vault for 30 days and receive receipt tokens
- **Earn bonus rewards** via BonusReserve

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS |
| Wallet | @solana/wallet-adapter, Phantom, Solflare, Backpack |
| Programs | Rust, Anchor framework, SPL |
| State | TanStack Query, Zustand |
| Network | Solana Devnet → mainnet-beta |

## Project Structure

```
AgroRWA/
├── programs/
│   ├── agro_registry/       # RWA asset registry program
│   ├── liquidity_pool/      # DEX pool program (swap, add/remove liquidity)
│   └── vault/               # LP vault + receipt token mint/burn
├── apps/web/                # Next.js 14 frontend
│   └── src/
│       ├── app/             # Pages (App Router)
│       ├── components/      # Reusable UI components
│       ├── hooks/           # Custom React hooks
│       ├── lib/             # Solana connection, program clients, IDLs
│       ├── config/          # Wallet adapter config
│       └── types/           # TypeScript types
├── tests/                   # Anchor integration tests
├── idl/                     # Generated IDL JSON files
├── scripts/                 # Deploy & utility scripts
└── docs/                    # Documentation
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing — intro, wallet connect, quick actions |
| `/tokens` | All registered RWA tokens |
| `/token/[mint]` | Token details, pools, create pair / add liquidity |
| `/register-token` | Register new agricultural asset |
| `/create-pool` | Create liquidity pair |
| `/add-liquidity` | Add liquidity to pool |
| `/market` | Market overview — pairs, price, reserves |
| `/swap` | Swap tokens |
| `/vault` | Deposit LP, mint receipt token, redeem |
| `/portfolio` | User LP positions and vault deposits |

## Solana Programs

| Program | Description |
|---------|-------------|
| `agro_registry` | Register & store RWA token metadata on-chain via PDAs |
| `liquidity_pool` | Create pools, swap, add/remove liquidity |
| `vault` | Lock LP tokens for 30 days, mint/burn receipt tokens |

## Quick Start

### Prerequisites
- Rust + Solana CLI 1.18+
- Anchor CLI 0.30+
- Node.js 20+

### 1. Install dependencies
```bash
# Root monorepo
npm install

# Frontend
cd apps/web && npm install
```

### 2. Build programs
```bash
anchor build
```

### 3. Deploy to devnet
```bash
anchor deploy --provider.cluster devnet
# Copy program IDs printed to console into apps/web/.env.local
```

### 4. Start frontend
```bash
cd apps/web
npm run dev
# Open http://localhost:3000
```

## Environment Variables

Copy `apps/web/.env.example` to `apps/web/.env.local`:

```env
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_REGISTRY_PROGRAM_ID=<from anchor deploy>
NEXT_PUBLIC_POOL_PROGRAM_ID=<from anchor deploy>
NEXT_PUBLIC_VAULT_PROGRAM_ID=<from anchor deploy>
```

## Testing

```bash
# Run all Anchor tests
anchor test

# Frontend
cd apps/web && npm test
```

## Documentation

- [Architecture](docs/architecture.md)
- [Programs](docs/contracts.md)
- [Deployment](docs/deployment.md)
- [User Flow](docs/user-flow.md)
