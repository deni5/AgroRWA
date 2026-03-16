use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("AgroAssetFWm4MDuTMWKJwdawF3VtUqWuZNi4Jq7TdJYWPnU5Yt8d111");

pub mod state;
pub mod errors;

use state::*;
use errors::AssetError;

#[program]
pub mod asset_registry {
    use super::*;

    /// Create a new tokenized asset (emitter must be KYC approved)
    pub fn create_asset(ctx: Context<CreateAsset>, args: CreateAssetArgs) -> Result<()> {
        require!(args.title.len() <= 64, AssetError::FieldTooLong);
        require!(args.description.len() <= 512, AssetError::FieldTooLong);

        let asset = &mut ctx.accounts.asset_record;
        let clock = Clock::get()?;

        asset.mint = ctx.accounts.mint.key();
        asset.emitter = ctx.accounts.emitter.key();
        asset.token_type = args.token_type;
        asset.title = args.title;
        asset.description = args.description;
        asset.category = args.category;
        asset.location_gps = args.location_gps;
        asset.characteristics = args.characteristics;
        asset.total_supply = args.total_supply;
        asset.unit = args.unit;
        asset.price_per_unit = args.price_per_unit;
        asset.currency = args.currency;
        asset.delivery_date = args.delivery_date;
        asset.docs_ipfs = args.docs_ipfs;
        asset.lifecycle_status = LifecycleStatus::Pending;
        asset.verification_count = 0;
        asset.required_verifications = args.required_verifications;
        asset.created_at = clock.unix_timestamp;
        asset.bump = ctx.bumps.asset_record;

        msg!("Asset created: {} type={:?}", asset.title, asset.token_type as u8);
        Ok(())
    }

    /// Update asset lifecycle status (oracle or admin)
    pub fn update_lifecycle(ctx: Context<UpdateLifecycle>, status: LifecycleStatus) -> Result<()> {
        ctx.accounts.asset_record.lifecycle_status = status;
        msg!("Asset lifecycle updated: {:?}", status as u8);
        Ok(())
    }

    /// Add document NFT hash to asset
    pub fn add_document(ctx: Context<AddDocument>, doc_ipfs: String, doc_type: DocType) -> Result<()> {
        let asset = &mut ctx.accounts.asset_record;
        require!(asset.docs_ipfs.len() < 10, AssetError::TooManyDocs);
        asset.docs_ipfs.push(doc_ipfs.clone());
        msg!("Document added to asset: {:?} {}", doc_type as u8, doc_ipfs);
        Ok(())
    }

    /// Freeze asset (admin or after dispute)
    pub fn freeze_asset(ctx: Context<FreezeAsset>) -> Result<()> {
        ctx.accounts.asset_record.lifecycle_status = LifecycleStatus::Frozen;
        msg!("Asset frozen: {}", ctx.accounts.asset_record.mint);
        Ok(())
    }

    /// Increment verification count when oracle signs
    pub fn increment_verifications(ctx: Context<IncrementVerifications>) -> Result<()> {
        let asset = &mut ctx.accounts.asset_record;
        asset.verification_count += 1;
        if asset.verification_count >= asset.required_verifications {
            asset.lifecycle_status = LifecycleStatus::Verified;
            msg!("Asset verified: {}", asset.mint);
        }
        Ok(())
    }
}

// ─── Args ─────────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateAssetArgs {
    pub token_type: TokenType,
    pub title: String,
    pub description: String,
    pub category: AssetCategory,
    pub location_gps: String,      // "48.3794,31.1656"
    pub characteristics: String,   // JSON: {"class":"2","moisture":"14%"}
    pub total_supply: u64,
    pub unit: String,              // "ton", "unit", "ha"
    pub price_per_unit: u64,       // in USDC (6 decimals)
    pub currency: PaymentCurrency,
    pub delivery_date: i64,
    pub docs_ipfs: Vec<String>,
    pub required_verifications: u8,
}

// ─── Account structs ──────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(args: CreateAssetArgs)]
pub struct CreateAsset<'info> {
    #[account(
        init,
        payer = emitter,
        space = AssetRecord::LEN,
        seeds = [b"asset", mint.key().as_ref()],
        bump
    )]
    pub asset_record: Account<'info, AssetRecord>,

    #[account(
        init,
        payer = emitter,
        mint::decimals = 6,
        mint::authority = emitter,
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub emitter: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateLifecycle<'info> {
    #[account(
        mut,
        seeds = [b"asset", asset_record.mint.as_ref()],
        bump = asset_record.bump
    )]
    pub asset_record: Account<'info, AssetRecord>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct AddDocument<'info> {
    #[account(
        mut,
        seeds = [b"asset", asset_record.mint.as_ref()],
        bump = asset_record.bump,
        has_one = emitter
    )]
    pub asset_record: Account<'info, AssetRecord>,
    pub emitter: Signer<'info>,
}

#[derive(Accounts)]
pub struct FreezeAsset<'info> {
    #[account(
        mut,
        seeds = [b"asset", asset_record.mint.as_ref()],
        bump = asset_record.bump
    )]
    pub asset_record: Account<'info, AssetRecord>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct IncrementVerifications<'info> {
    #[account(
        mut,
        seeds = [b"asset", asset_record.mint.as_ref()],
        bump = asset_record.bump
    )]
    pub asset_record: Account<'info, AssetRecord>,
    pub oracle: Signer<'info>,
}
