use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("AgroRWA11111111111111111111111111111111111111");

#[program]
pub mod agro_rwa {
    use super::*;

    /// Register a new farmer with their land/asset details
    pub fn register_farmer(
        ctx: Context<RegisterFarmer>,
        args: RegisterFarmerArgs,
    ) -> Result<()> {
        instructions::register_farmer::handler(ctx, args)
    }

    /// Create a new harvest token mint (Token-2022)
    pub fn create_harvest_token(
        ctx: Context<CreateHarvestToken>,
        args: CreateHarvestTokenArgs,
    ) -> Result<()> {
        instructions::create_harvest_token::handler(ctx, args)
    }

    /// Mint harvest tokens to an investor
    pub fn mint_harvest_tokens(
        ctx: Context<MintHarvestTokens>,
        amount: u64,
    ) -> Result<()> {
        instructions::mint_harvest_tokens::handler(ctx, amount)
    }

    /// Burn tokens upon harvest delivery confirmation
    pub fn confirm_delivery(
        ctx: Context<ConfirmDelivery>,
        delivered_amount: u64,
    ) -> Result<()> {
        instructions::confirm_delivery::handler(ctx, delivered_amount)
    }

    /// Update farmer rating (admin only)
    pub fn update_farmer_rating(
        ctx: Context<UpdateFarmerRating>,
        new_score: u8,
        category: RatingCategory,
    ) -> Result<()> {
        instructions::update_farmer_rating::handler(ctx, new_score, category)
    }

    /// List tokens on marketplace
    pub fn list_tokens(
        ctx: Context<ListTokens>,
        amount: u64,
        price_per_token: u64,
    ) -> Result<()> {
        instructions::list_tokens::handler(ctx, amount, price_per_token)
    }

    /// Buy listed tokens
    pub fn buy_tokens(
        ctx: Context<BuyTokens>,
        amount: u64,
    ) -> Result<()> {
        instructions::buy_tokens::handler(ctx, amount)
    }

    /// Freeze/unfreeze investor account (compliance)
    pub fn set_account_state(
        ctx: Context<SetAccountState>,
        freeze: bool,
    ) -> Result<()> {
        instructions::set_account_state::handler(ctx, freeze)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum RatingCategory {
    ProductionHistory,
    DeliveryPerformance,
    FinancialReliability,
    AssetVerification,
}
