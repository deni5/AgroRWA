use anchor_lang::prelude::*;

#[error_code]
pub enum PoolError {
    #[msg("Cannot create a pool with the same token")]
    SameTokens,
    #[msg("Token mints must be in sorted order (A < B by pubkey)")]
    UnsortedTokens,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Pool has no liquidity")]
    EmptyPool,
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
    #[msg("Swap output is zero")]
    ZeroOutput,
    #[msg("Math overflow")]
    MathOverflow,
}
