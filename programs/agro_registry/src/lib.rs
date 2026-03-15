use anchor_lang::prelude::*;

declare_id!("AgroReg111111111111111111111111111111111111");

pub mod errors;
pub mod state;
pub mod instructions;

use instructions::*;

#[program]
pub mod agro_registry {
    use super::*;

    /// Register a new agricultural RWA token
    pub fn register_token(
        ctx: Context<RegisterToken>,
        args: RegisterTokenArgs,
    ) -> Result<()> {
        instructions::register_token(ctx, args)
    }

    /// Update token metadata (creator only)
    pub fn update_token(
        ctx: Context<UpdateToken>,
        args: UpdateTokenArgs,
    ) -> Result<()> {
        instructions::update_token(ctx, args)
    }
}

// ─── Args ────────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RegisterTokenArgs {
    pub title: String,           // max 64
    pub description: String,     // max 256
    pub category: AssetCategory,
    pub logo_url: String,        // max 128 (IPFS or https)
    pub bonus_enabled: bool,
    pub reward_mint: Option<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateTokenArgs {
    pub title: Option<String>,
    pub description: Option<String>,
    pub logo_url: Option<String>,
    pub bonus_enabled: Option<bool>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum AssetCategory {
    Farmland,
    GrainProduction,
    Livestock,
    HarvestFutures,
    AgriculturalMachinery,
    Other,
}
