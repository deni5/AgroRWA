use anchor_lang::prelude::*;

/// PDA: ["pool", token_a_mint, token_b_mint]
/// token_a_mint < token_b_mint (sorted by pubkey to ensure uniqueness)
#[account]
pub struct Pool {
    /// Mint of token A (smaller pubkey)
    pub token_a_mint: Pubkey,
    /// Mint of token B (larger pubkey)
    pub token_b_mint: Pubkey,
    /// Vault holding token A reserves
    pub vault_a: Pubkey,
    /// Vault holding token B reserves
    pub vault_b: Pubkey,
    /// LP token mint (minted to liquidity providers)
    pub lp_mint: Pubkey,
    /// Creator wallet
    pub creator: Pubkey,
    /// Current reserve of token A
    pub reserve_a: u64,
    /// Current reserve of token B
    pub reserve_b: u64,
    /// Total LP tokens in circulation
    pub lp_supply: u64,
    /// Fee in basis points (e.g. 30 = 0.30%)
    pub fee_bps: u16,
    /// Unix timestamp of pool creation
    pub created_at: i64,
    /// PDA bump
    pub bump: u8,
}

impl Pool {
    pub const LEN: usize = 8
        + 32  // token_a_mint
        + 32  // token_b_mint
        + 32  // vault_a
        + 32  // vault_b
        + 32  // lp_mint
        + 32  // creator
        + 8   // reserve_a
        + 8   // reserve_b
        + 8   // lp_supply
        + 2   // fee_bps
        + 8   // created_at
        + 1;  // bump

    /// AMM constant product: x * y = k
    pub fn get_amount_out(&self, amount_in: u64, a_to_b: bool) -> Option<u64> {
        let (reserve_in, reserve_out) = if a_to_b {
            (self.reserve_a, self.reserve_b)
        } else {
            (self.reserve_b, self.reserve_a)
        };

        if reserve_in == 0 || reserve_out == 0 {
            return None;
        }

        // fee deduction: amount_in * (10000 - fee_bps) / 10000
        let fee_denom: u128 = 10_000;
        let amount_in_with_fee =
            (amount_in as u128) * (fee_denom - self.fee_bps as u128) / fee_denom;

        // dy = (y * dx_fee) / (x + dx_fee)
        let numerator = (reserve_out as u128).checked_mul(amount_in_with_fee)?;
        let denominator = (reserve_in as u128).checked_add(amount_in_with_fee)?;

        Some((numerator / denominator) as u64)
    }

    /// Calculate LP tokens to mint given deposit amounts
    pub fn calc_lp_to_mint(&self, amount_a: u64, amount_b: u64) -> Option<u64> {
        if self.lp_supply == 0 {
            // First deposit: geometric mean
            let product = (amount_a as u128).checked_mul(amount_b as u128)?;
            Some((product as f64).sqrt() as u64)
        } else {
            // Proportional to smaller share
            let share_a = (amount_a as u128)
                .checked_mul(self.lp_supply as u128)?
                .checked_div(self.reserve_a as u128)?;
            let share_b = (amount_b as u128)
                .checked_mul(self.lp_supply as u128)?
                .checked_div(self.reserve_b as u128)?;
            Some(share_a.min(share_b) as u64)
        }
    }
}
