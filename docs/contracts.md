# Solana Programs

## agro_registry

Stores on-chain metadata for tokenized agricultural assets.

### Account: `AgroAsset`

| Field | Type | Description |
|-------|------|-------------|
| `mint` | Pubkey | SPL token mint address |
| `creator` | Pubkey | Wallet that registered the asset |
| `title` | String (≤64) | Human-readable name |
| `description` | String (≤256) | Asset description |
| `category` | Enum | Farmland / GrainProduction / Livestock / HarvestFutures / AgriculturalMachinery / Other |
| `logo_url` | String (≤128) | IPFS CID or HTTPS URL |
| `bonus_enabled` | bool | Whether bonus rewards are active |
| `reward_mint` | Option\<Pubkey\> | SPL mint for bonus token |
| `registered_at` | i64 | Unix timestamp |

PDA seeds: `["agro_asset", mint]`

### Instructions

**`register_token(args)`** — Creates a new `AgroAsset` PDA. The mint must already exist. Creator pays rent.

**`update_token(args)`** — Updates mutable fields (title, description, logo, bonus). Only the original creator can call this.

---

## liquidity_pool

Constant product AMM (x·y=k) for agricultural token pairs.

### Account: `Pool`

| Field | Type | Description |
|-------|------|-------------|
| `token_a_mint` | Pubkey | Mint with smaller pubkey |
| `token_b_mint` | Pubkey | Mint with larger pubkey |
| `vault_a` | Pubkey | Token A reserve vault |
| `vault_b` | Pubkey | Token B reserve vault |
| `lp_mint` | Pubkey | LP token mint |
| `creator` | Pubkey | Pool creator |
| `reserve_a` | u64 | Current token A reserve |
| `reserve_b` | u64 | Current token B reserve |
| `lp_supply` | u64 | LP tokens in circulation |
| `fee_bps` | u16 | Trading fee (30 = 0.30%) |
| `created_at` | i64 | Creation timestamp |

PDA seeds: `["pool", mintA, mintB]` (mints always sorted, mintA < mintB)

### Instructions

**`create_pool()`** — Initializes pool, vault accounts, and LP mint. Validates mint ordering.

**`add_liquidity(amount_a, amount_b, min_lp_out)`** — Deposits tokens, mints LP tokens. First deposit uses geometric mean. Subsequent deposits use proportional formula. Slippage protected by `min_lp_out`.

**`remove_liquidity(lp_amount, min_a_out, min_b_out)`** — Burns LP tokens, returns proportional reserves. Slippage protected.

**`swap(amount_in, min_amount_out, a_to_b)`** — Executes constant-product swap with 0.30% fee. Slippage protected by `min_amount_out`.

---

## vault

LP token locking with 30-day timelock and receipt token issuance.

### Account: `VaultDeposit`

| Field | Type | Description |
|-------|------|-------------|
| `user` | Pubkey | Depositor wallet |
| `lp_mint` | Pubkey | LP token that was locked |
| `amount` | u64 | Amount locked |
| `unlock_time` | i64 | Unix timestamp when redeemable |
| `redeemed` | bool | Whether already redeemed |

PDA seeds: `["vault_deposit", user, lp_mint]`

### Instructions

**`deposit_lp(amount)`** — Transfers LP tokens from user to vault PDA. Mints receipt tokens 1:1 to user. Sets `unlock_time = now + 2592000` (30 days).

**`redeem_lp()`** — Validates lock period has elapsed and deposit is not redeemed. Burns receipt tokens. Returns LP tokens to user. Marks deposit as redeemed.

### Receipt Tokens

- Mint PDA seeds: `["receipt_mint", lp_mint]`
- Authority PDA seeds: `["receipt_authority", lp_mint]`
- Minted 1:1 on deposit, burned on redeem
- Transferable (can be traded as position tokens)
