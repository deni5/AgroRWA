use anchor_lang::prelude::*;
use crate::AssetCategory;

/// PDA: ["agro_asset", mint]
#[account]
pub struct AgroAsset {
    /// SPL token mint this record describes
    pub mint: Pubkey,
    /// Wallet that registered this asset
    pub creator: Pubkey,
    /// Human-readable name
    pub title: String,
    /// Description of the asset
    pub description: String,
    /// Asset category
    pub category: AssetCategory,
    /// Logo (IPFS CID or https URL)
    pub logo_url: String,
    /// Whether bonus rewards are enabled
    pub bonus_enabled: bool,
    /// Optional SPL mint used for bonus rewards
    pub reward_mint: Option<Pubkey>,
    /// Unix timestamp of registration
    pub registered_at: i64,
    /// Bump for PDA derivation
    pub bump: u8,
}

impl AgroAsset {
    /// Discriminator (8) + fields
    pub const LEN: usize = 8
        + 32  // mint
        + 32  // creator
        + 4 + 64   // title
        + 4 + 256  // description
        + 1 + 1    // category enum
        + 4 + 128  // logo_url
        + 1        // bonus_enabled
        + 1 + 32   // reward_mint (Option<Pubkey>)
        + 8        // registered_at
        + 1;       // bump
}
