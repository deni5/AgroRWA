use anchor_lang::prelude::*;

#[error_code]
pub enum InsuranceError {
    #[msg("Claim amount must be greater than zero")]
    ZeroAmount,
    #[msg("Claim is not in pending status")]
    ClaimNotPending,
    #[msg("Insufficient funds in insurance pool")]
    InsufficientFunds,
    #[msg("Unauthorized — admin only")]
    Unauthorized,
}
