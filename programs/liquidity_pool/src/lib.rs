use anchor_lang::prelude::*;

declare_id!("AgroPool11111111111111111111111111111111111");

pub mod errors;
pub mod state;
pub mod instructions;

use instructions::*;

#[program]
pub mod liquidity_pool {
    use super::*;

    /// Create a new AgroToken/X liquidity pool
    pub fn create_pool(ctx: Context<CreatePool>) -> Result<()> {
        instructions::create_pool(ctx)
    }

    /// Add liquidity to an existing pool
    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        amount_a: u64,
        amount_b: u64,
        min_lp_out: u64,
    ) -> Result<()> {
        instructions::add_liquidity(ctx, amount_a, amount_b, min_lp_out)
    }

    /// Remove liquidity from pool
    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        lp_amount: u64,
        min_a_out: u64,
        min_b_out: u64,
    ) -> Result<()> {
        instructions::remove_liquidity(ctx, lp_amount, min_a_out, min_b_out)
    }

    /// Swap token A for token B (or vice versa)
    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        min_amount_out: u64,
        a_to_b: bool,
    ) -> Result<()> {
        instructions::swap(ctx, amount_in, min_amount_out, a_to_b)
    }
}
