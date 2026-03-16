use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("AgroMkt1111111111111111111111111111111111111");

pub mod state;
pub mod errors;

use state::*;
use errors::MarketError;

pub const PLATFORM_ADMIN: Pubkey = anchor_lang::solana_program::pubkey!("FWm4MDuTMWKJwdawF3VtUqWuZNi4Jq7TdJYWPnU5Yt8d");
pub const PLATFORM_FEE_BPS: u64 = 50;
pub const INSURANCE_FEE_BPS: u64 = 50;
pub const ORACLE_FEE_BPS: u64 = 50;

#[program]
pub mod marketplace {
    use super::*;

    /// Emitter creates listing — tokens locked in escrow
    pub fn create_listing(ctx: Context<CreateListing>, args: CreateListingArgs) -> Result<()> {
        require!(args.amount > 0, MarketError::ZeroAmount);
        require!(args.price_per_unit > 0, MarketError::ZeroPrice);
        require!(args.min_lot > 0 && args.min_lot <= args.amount, MarketError::InvalidLot);

        let listing = &mut ctx.accounts.listing;
        let clock = Clock::get()?;

        listing.asset_mint = ctx.accounts.asset_mint.key();
        listing.emitter = ctx.accounts.emitter.key();
        listing.escrow_vault = ctx.accounts.escrow_vault.key();
        listing.amount = args.amount;
        listing.amount_remaining = args.amount;
        listing.price_per_unit = args.price_per_unit;
        listing.currency = args.currency;
        listing.min_lot = args.min_lot;
        listing.listing_type = ListingType::Primary;
        listing.status = ListingStatus::Active;
        listing.created_at = clock.unix_timestamp;
        listing.expires_at = args.expires_at;
        listing.bump = ctx.bumps.listing;

        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
                from: ctx.accounts.emitter_token_account.to_account_info(),
                to: ctx.accounts.escrow_vault.to_account_info(),
                authority: ctx.accounts.emitter.to_account_info(),
            }),
            args.amount,
        )?;

        msg!("Listing created: {} tokens @ {} per unit", args.amount, args.price_per_unit);
        Ok(())
    }

    /// Investor fills order — atomic swap payment ↔ tokens
    pub fn fill_order(ctx: Context<FillOrder>, amount: u64) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        let clock = Clock::get()?;

        require!(listing.status == ListingStatus::Active, MarketError::ListingNotActive);
        require!(amount >= listing.min_lot, MarketError::BelowMinLot);
        require!(amount <= listing.amount_remaining, MarketError::InsufficientTokens);

        if let Some(expires) = listing.expires_at {
            require!(clock.unix_timestamp < expires, MarketError::ListingExpired);
        }

        // Payment breakdown (price_per_unit is per token with 6 decimals)
        let total = (listing.price_per_unit as u128)
            .checked_mul(amount as u128).ok_or(MarketError::MathOverflow)? as u64;

        let platform_fee  = total * PLATFORM_FEE_BPS  / 10_000;
        let insurance_fee = total * INSURANCE_FEE_BPS / 10_000;
        let oracle_fee    = total * ORACLE_FEE_BPS    / 10_000;
        let emitter_net   = total - platform_fee - insurance_fee - oracle_fee;

        // 1. Pay emitter
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.investor_payment.to_account_info(),
            to: ctx.accounts.emitter_payment.to_account_info(),
            authority: ctx.accounts.investor.to_account_info(),
        }), emitter_net)?;

        // 2. Pay platform
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.investor_payment.to_account_info(),
            to: ctx.accounts.platform_vault.to_account_info(),
            authority: ctx.accounts.investor.to_account_info(),
        }), platform_fee)?;

        // 3. Pay insurance fund
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.investor_payment.to_account_info(),
            to: ctx.accounts.insurance_vault.to_account_info(),
            authority: ctx.accounts.investor.to_account_info(),
        }), insurance_fee)?;

        // 4. Pay oracle fee pool
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.investor_payment.to_account_info(),
            to: ctx.accounts.oracle_fee_vault.to_account_info(),
            authority: ctx.accounts.investor.to_account_info(),
        }), oracle_fee)?;

        // 5. Release tokens from escrow to investor
        let asset_mint_key = listing.asset_mint;
        let emitter_key = listing.emitter;
        let bump = listing.bump;
        let seeds = &[b"listing".as_ref(), asset_mint_key.as_ref(), emitter_key.as_ref(), &[bump]];
        token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.escrow_vault.to_account_info(),
            to: ctx.accounts.investor_token_account.to_account_info(),
            authority: ctx.accounts.listing.to_account_info(),
        }, &[seeds]), amount)?;

        // Record trade
        let trade = &mut ctx.accounts.trade_record;
        trade.listing = listing.key();
        trade.asset_mint = listing.asset_mint;
        trade.seller = listing.emitter;
        trade.buyer = ctx.accounts.investor.key();
        trade.amount = amount;
        trade.price_per_unit = listing.price_per_unit;
        trade.total_payment = total;
        trade.platform_fee = platform_fee;
        trade.insurance_fee = insurance_fee;
        trade.oracle_fee = oracle_fee;
        trade.traded_at = clock.unix_timestamp;
        trade.bump = ctx.bumps.trade_record;

        listing.amount_remaining = listing.amount_remaining.saturating_sub(amount);
        if listing.amount_remaining == 0 {
            listing.status = ListingStatus::Filled;
        }

        msg!("Trade: {} tokens, {} total, {} to seller", amount, total, emitter_net);
        Ok(())
    }

    /// Secondary market — investor re-lists their tokens
    pub fn create_secondary_listing(ctx: Context<CreateSecondaryListing>, args: CreateListingArgs) -> Result<()> {
        require!(args.amount > 0, MarketError::ZeroAmount);
        require!(args.price_per_unit > 0, MarketError::ZeroPrice);

        let listing = &mut ctx.accounts.listing;
        let clock = Clock::get()?;

        listing.asset_mint = ctx.accounts.asset_mint.key();
        listing.emitter = ctx.accounts.seller.key();
        listing.escrow_vault = ctx.accounts.escrow_vault.key();
        listing.amount = args.amount;
        listing.amount_remaining = args.amount;
        listing.price_per_unit = args.price_per_unit;
        listing.currency = args.currency;
        listing.min_lot = args.min_lot;
        listing.listing_type = ListingType::Secondary;
        listing.status = ListingStatus::Active;
        listing.created_at = clock.unix_timestamp;
        listing.expires_at = args.expires_at;
        listing.bump = ctx.bumps.listing;

        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.seller_token_account.to_account_info(),
            to: ctx.accounts.escrow_vault.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        }), args.amount)?;

        msg!("Secondary listing: {} tokens @ {}", args.amount, args.price_per_unit);
        Ok(())
    }

    /// Cancel listing — return tokens to seller
    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        require!(listing.status == ListingStatus::Active, MarketError::ListingNotActive);

        let asset_mint_key = listing.asset_mint;
        let emitter_key = listing.emitter;
        let bump = listing.bump;
        let seeds = &[b"listing".as_ref(), asset_mint_key.as_ref(), emitter_key.as_ref(), &[bump]];

        token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.escrow_vault.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: listing.to_account_info(),
        }, &[seeds]), listing.amount_remaining)?;

        listing.status = ListingStatus::Cancelled;
        msg!("Listing cancelled, {} tokens returned", listing.amount_remaining);
        Ok(())
    }
}

// ─── Args ─────────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateListingArgs {
    pub amount: u64,
    pub price_per_unit: u64,
    pub currency: PaymentCurrency,
    pub min_lot: u64,
    pub expires_at: Option<i64>,
}

// ─── Account structs ──────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(args: CreateListingArgs)]
pub struct CreateListing<'info> {
    #[account(
        init, payer = emitter,
        space = Listing::LEN,
        seeds = [b"listing", asset_mint.key().as_ref(), emitter.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,

    pub asset_mint: Account<'info, Mint>,

    #[account(
        init_if_needed, payer = emitter,
        token::mint = asset_mint,
        token::authority = listing,
        seeds = [b"escrow", asset_mint.key().as_ref(), emitter.key().as_ref()],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut, token::mint = asset_mint, token::authority = emitter)]
    pub emitter_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub emitter: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct FillOrder<'info> {
    #[account(
        mut,
        seeds = [b"listing", listing.asset_mint.as_ref(), listing.emitter.as_ref()],
        bump = listing.bump
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        init, payer = investor,
        space = TradeRecord::LEN,
        seeds = [b"trade", listing.key().as_ref(), investor.key().as_ref()],
        bump
    )]
    pub trade_record: Account<'info, TradeRecord>,

    #[account(mut, seeds = [b"escrow", listing.asset_mint.as_ref(), listing.emitter.as_ref()], bump)]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut)] pub investor_payment: Account<'info, TokenAccount>,
    #[account(mut)] pub emitter_payment: Account<'info, TokenAccount>,
    #[account(mut)] pub platform_vault: Account<'info, TokenAccount>,
    #[account(mut)] pub insurance_vault: Account<'info, TokenAccount>,
    #[account(mut)] pub oracle_fee_vault: Account<'info, TokenAccount>,
    #[account(mut)] pub investor_token_account: Account<'info, TokenAccount>,

    #[account(mut)] pub investor: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(args: CreateListingArgs)]
pub struct CreateSecondaryListing<'info> {
    #[account(
        init, payer = seller,
        space = Listing::LEN,
        seeds = [b"listing", asset_mint.key().as_ref(), seller.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,

    pub asset_mint: Account<'info, Mint>,

    #[account(
        init_if_needed, payer = seller,
        token::mint = asset_mint,
        token::authority = listing,
        seeds = [b"escrow", asset_mint.key().as_ref(), seller.key().as_ref()],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut, token::mint = asset_mint, token::authority = seller)]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(mut)] pub seller: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CancelListing<'info> {
    #[account(
        mut,
        seeds = [b"listing", listing.asset_mint.as_ref(), listing.emitter.as_ref()],
        bump = listing.bump,
        has_one = emitter
    )]
    pub listing: Account<'info, Listing>,

    #[account(mut, seeds = [b"escrow", listing.asset_mint.as_ref(), listing.emitter.as_ref()], bump)]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut)] pub seller_token_account: Account<'info, TokenAccount>,
    pub emitter: Signer<'info>,
    pub token_program: Program<'info, Token>,
}
