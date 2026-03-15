use anchor_lang::prelude::*;

#[error_code]
pub enum VaultError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Tokens are still locked — wait until unlock time")]
    StillLocked,
    #[msg("This deposit has already been redeemed")]
    AlreadyRedeemed,
}
