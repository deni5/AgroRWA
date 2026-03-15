use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use crate::state::AgroAsset;
use crate::{RegisterTokenArgs, UpdateTokenArgs};
use crate::errors::RegistryError;

pub fn register_token(ctx: Context<RegisterToken>, args: RegisterTokenArgs) -> Result<()> {
    require!(args.title.len() <= 64, RegistryError::TitleTooLong);
    require!(args.description.len() <= 256, RegistryError::DescriptionTooLong);
    require!(args.logo_url.len() <= 128, RegistryError::LogoUrlTooLong);

    let asset = &mut ctx.accounts.agro_asset;
    let clock = Clock::get()?;

    asset.mint = ctx.accounts.mint.key();
    asset.creator = ctx.accounts.creator.key();
    asset.title = args.title;
    asset.description = args.description;
    asset.category = args.category;
    asset.logo_url = args.logo_url;
    asset.bonus_enabled = args.bonus_enabled;
    asset.reward_mint = args.reward_mint;
    asset.registered_at = clock.unix_timestamp;
    asset.bump = ctx.bumps.agro_asset;

    msg!("AgroAsset registered: {}", asset.mint);
    Ok(())
}

pub fn update_token(ctx: Context<UpdateToken>, args: UpdateTokenArgs) -> Result<()> {
    let asset = &mut ctx.accounts.agro_asset;

    if let Some(title) = args.title {
        require!(title.len() <= 64, RegistryError::TitleTooLong);
        asset.title = title;
    }
    if let Some(desc) = args.description {
        require!(desc.len() <= 256, RegistryError::DescriptionTooLong);
        asset.description = desc;
    }
    if let Some(logo) = args.logo_url {
        require!(logo.len() <= 128, RegistryError::LogoUrlTooLong);
        asset.logo_url = logo;
    }
    if let Some(bonus) = args.bonus_enabled {
        asset.bonus_enabled = bonus;
    }

    Ok(())
}

// ─── Accounts ────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct RegisterToken<'info> {
    #[account(
        init,
        payer = creator,
        space = AgroAsset::LEN,
        seeds = [b"agro_asset", mint.key().as_ref()],
        bump
    )]
    pub agro_asset: Account<'info, AgroAsset>,

    /// The SPL token mint being registered (must already exist)
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateToken<'info> {
    #[account(
        mut,
        seeds = [b"agro_asset", agro_asset.mint.as_ref()],
        bump = agro_asset.bump,
        has_one = creator
    )]
    pub agro_asset: Account<'info, AgroAsset>,

    pub creator: Signer<'info>,
}
