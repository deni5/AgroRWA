use anchor_lang::prelude::*;

#[error_code]
pub enum MarketError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Price must be greater than zero")]
    ZeroPrice,
    #[msg("Invalid lot size")]
    InvalidLot,
    #[msg("Listing is not active")]
    ListingNotActive,
    #[msg("Amount below minimum lot")]
    BelowMinLot,
    #[msg("Insufficient tokens in escrow")]
    InsufficientTokens,
    #[msg("Listing has expired")]
    ListingExpired,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Asset not verified by oracles")]
    AssetNotVerified,
    #[msg("Unauthorized")]
    Unauthorized,
}
