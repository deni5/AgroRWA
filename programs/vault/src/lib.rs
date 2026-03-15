use anchor_lang::prelude::*;

declare_id!("AgroVault1111111111111111111111111111111111");

pub mod errors;
pub mod state;
pub mod instructions;

use instructions::*;

pub const LOCK_DURATION: i64 = 30 * 24 * 60 * 60; // 30 days in seconds

#[program]
pub mod vault {
    use super::*;

    /// Deposit LP tokens into vault; mint receipt tokens to user
    pub fn deposit_lp(
        ctx: Context<DepositLp>,
        amount: u64,
    ) -> Result<()> {
        instructions::deposit_lp(ctx, amount)
    }

    /// Redeem receipt tokens after lock period; get LP tokens back
    pub fn redeem_lp(ctx: Context<RedeemLp>) -> Result<()> {
        instructions::redeem_lp(ctx)
    }
}
