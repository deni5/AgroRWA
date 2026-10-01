use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("J1BxLiUjYbfiS9yFHSvud6dPb9A13MTJeYAg4K1ZMEGC");

pub mod state;
pub mod errors;

use state::*;
use errors::MarketError;

pub const PLATFORM_ADMIN_STR: &str = "FWm4MDuTMWKJwdawF3VtUqWuZNi4Jq7TdJYWPnU5Yt8d";
pub const PLATFORM_FEE_BPS: u64 = 50;
pub const INSURANCE_FEE_BPS: u64 = 50;
pub const ORACLE_FEE_BPS: u64 = 50;

/// Результат розрахунку комісій для однієї угоди fill_order.
/// Винесено в окрему структуру, щоб calculate_fees мала один чіткий
/// обов'язок (SRP) і не змішувала розрахунок із переказами токенів.
pub struct OrderFees {
    pub total: u64,
    pub platform_fee: u64,
    pub insurance_fee: u64,
    pub oracle_fee: u64,
    pub emitter_net: u64,
}

/// Перевірка бізнес-правил лістингу перед виконанням угоди.
/// Guard-clause стиль (require! одразу виходить з помилкою) — складність
/// не змінюється порівняно з оригіналом, але перевірки ізольовані від
/// решти логіки fill_order і їх можна покрити окремими unit-тестами.
fn validate_fill(listing: &Listing, clock: &Clock, amount: u64) -> Result<()> {
    require!(listing.status == ListingStatus::Active, MarketError::ListingNotActive);
    require!(amount >= listing.min_lot, MarketError::BelowMinLot);
    require!(amount <= listing.amount_remaining, MarketError::InsufficientTokens);
    if let Some(exp) = listing.expires_at {
        require!(clock.unix_timestamp < exp, MarketError::ListingExpired);
    }
    Ok(())
}

/// Розрахунок суми угоди та трьох комісій. Чиста функція без побічних
/// ефектів (не звертається до ctx.accounts) — легко тестувати ізольовано.
fn calculate_fees(price_per_unit: u64, amount: u64) -> Result<OrderFees> {
    let total = (price_per_unit as u128)
        .checked_mul(amount as u128).ok_or(MarketError::MathOverflow)? as u64;
    let platform_fee = total * PLATFORM_FEE_BPS / 10_000;
    let insurance_fee = total * INSURANCE_FEE_BPS / 10_000;
    let oracle_fee = total * ORACLE_FEE_BPS / 10_000;
    let emitter_net = total - platform_fee - insurance_fee - oracle_fee;
    Ok(OrderFees { total, platform_fee, insurance_fee, oracle_fee, emitter_net })
}

/// Чотири перекази CPI, що розподіляють кошти інвестора між емітентом
/// і трьома vault-ами комісій. Винесено окремо від розрахунку (crate_fees)
/// та від запису угоди (record_trade) — кожна функція відповідає за один крок.
fn distribute_payment(ctx: &Context<FillOrder>, fees: &OrderFees) -> Result<()> {
    token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
        from: ctx.accounts.investor_payment.to_account_info(),
        to: ctx.accounts.emitter_payment.to_account_info(),
        authority: ctx.accounts.investor.to_account_info(),
    }), fees.emitter_net)?;
    token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
        from: ctx.accounts.investor_payment.to_account_info(),
        to: ctx.accounts.platform_vault.to_account_info(),
        authority: ctx.accounts.investor.to_account_info(),
    }), fees.platform_fee)?;
    token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
        from: ctx.accounts.investor_payment.to_account_info(),
        to: ctx.accounts.insurance_vault.to_account_info(),
        authority: ctx.accounts.investor.to_account_info(),
    }), fees.insurance_fee)?;
    token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
        from: ctx.accounts.investor_payment.to_account_info(),
        to: ctx.accounts.oracle_fee_vault.to_account_info(),
        authority: ctx.accounts.investor.to_account_info(),
    }), fees.oracle_fee)?;
    Ok(())
}

/// Переказ активу з ескроу інвестору, підписаний PDA лістингу.
fn release_escrow(ctx: &Context<FillOrder>, amount: u64) -> Result<()> {
    let asset_mint_key = ctx.accounts.listing.asset_mint;
    let emitter_key = ctx.accounts.listing.emitter;
    let bump = ctx.accounts.listing.bump;
    let seeds = &[b"listing".as_ref(), asset_mint_key.as_ref(), emitter_key.as_ref(), &[bump]];
    token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Transfer {
        from: ctx.accounts.escrow_vault.to_account_info(),
        to: ctx.accounts.investor_token_account.to_account_info(),
        authority: ctx.accounts.listing.to_account_info(),
    }, &[seeds]), amount)
}

/// Запис історичного запису про угоду (TradeRecord). Без розгалужень —
/// лише присвоєння полів, тому на складність V(G) не впливає, але раніше
/// була перемішана в тілі fill_order з розрахунками й переказами.
fn record_trade(accounts: &mut FillOrder, amount: u64, fees: &OrderFees, traded_at: i64, trade_bump: u8) {
    let listing_key = accounts.listing.key();
    let asset_mint = accounts.listing.asset_mint;
    let seller = accounts.listing.emitter;
    let price_per_unit = accounts.listing.price_per_unit;
    let buyer = accounts.investor.key();
    let trade = &mut accounts.trade_record;
    trade.listing = listing_key;
    trade.asset_mint = asset_mint;
    trade.seller = seller;
    trade.buyer = buyer;
    trade.amount = amount;
    trade.price_per_unit = price_per_unit;
    trade.total_payment = fees.total;
    trade.platform_fee = fees.platform_fee;
    trade.insurance_fee = fees.insurance_fee;
    trade.oracle_fee = fees.oracle_fee;
    trade.traded_at = traded_at;
    trade.bump = trade_bump;
}

/// Оновлення залишку лістингу та, за потреби, закриття його статусом Filled.
fn close_if_filled(listing: &mut Listing, amount: u64) {
    listing.amount_remaining = listing.amount_remaining.saturating_sub(amount);
    if listing.amount_remaining == 0 {
        listing.status = ListingStatus::Filled;
    }
}

#[program]
pub mod marketplace {
    use super::*;

    pub fn create_listing(ctx: Context<CreateListing>, args: CreateListingArgs) -> Result<()> {
        require!(args.amount > 0, MarketError::ZeroAmount);
        require!(args.price_per_unit > 0, MarketError::ZeroPrice);
        require!(args.min_lot > 0 && args.min_lot <= args.amount, MarketError::InvalidLot);
        let clock = Clock::get()?;
        let listing = &mut ctx.accounts.listing;
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
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.emitter_token_account.to_account_info(),
            to: ctx.accounts.escrow_vault.to_account_info(),
            authority: ctx.accounts.emitter.to_account_info(),
        }), args.amount)?;
        Ok(())
    }

    pub fn fill_order(mut ctx: Context<FillOrder>, amount: u64) -> Result<()> {
        let clock = Clock::get()?;
        validate_fill(&ctx.accounts.listing, &clock, amount)?;

        let fees = calculate_fees(ctx.accounts.listing.price_per_unit, amount)?;

        distribute_payment(&ctx, &fees)?;
        release_escrow(&ctx, amount)?;

        let bump = ctx.bumps.trade_record;
        let traded_at = clock.unix_timestamp;
        record_trade(&mut ctx.accounts, amount, &fees, traded_at, bump);
        close_if_filled(&mut ctx.accounts.listing, amount);

        Ok(())
    }

    pub fn create_secondary_listing(ctx: Context<CreateSecondaryListing>, args: CreateListingArgs) -> Result<()> {
        require!(args.amount > 0, MarketError::ZeroAmount);
        require!(args.price_per_unit > 0, MarketError::ZeroPrice);
        let clock = Clock::get()?;
        let listing = &mut ctx.accounts.listing;
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
        Ok(())
    }

    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        require!(ctx.accounts.listing.status == ListingStatus::Active, MarketError::ListingNotActive);
        let remaining = ctx.accounts.listing.amount_remaining;
        let asset_mint_key = ctx.accounts.listing.asset_mint;
        let emitter_key = ctx.accounts.listing.emitter;
        let bump = ctx.accounts.listing.bump;
        let seeds = &[b"listing".as_ref(), asset_mint_key.as_ref(), emitter_key.as_ref(), &[bump]];
        token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.escrow_vault.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.listing.to_account_info(),
        }, &[seeds]), remaining)?;
        ctx.accounts.listing.status = ListingStatus::Cancelled;
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateListingArgs {
    pub amount: u64,
    pub price_per_unit: u64,
    pub currency: PaymentCurrency,
    pub min_lot: u64,
    pub expires_at: Option<i64>,
}

#[derive(Accounts)]
#[instruction(args: CreateListingArgs)]
pub struct CreateListing<'info> {
    #[account(init, payer = emitter, space = Listing::LEN,
        seeds = [b"listing", asset_mint.key().as_ref(), emitter.key().as_ref()], bump)]
    pub listing: Account<'info, Listing>,
    pub asset_mint: Account<'info, Mint>,
    #[account(init, payer = emitter, token::mint = asset_mint, token::authority = listing,
        seeds = [b"escrow", asset_mint.key().as_ref(), emitter.key().as_ref()], bump)]
    pub escrow_vault: Account<'info, TokenAccount>,
    #[account(mut, token::mint = asset_mint, token::authority = emitter)]
    pub emitter_token_account: Account<'info, TokenAccount>,
    #[account(mut)] pub emitter: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct FillOrder<'info> {
    #[account(mut, seeds = [b"listing", listing.asset_mint.as_ref(), listing.emitter.as_ref()], bump = listing.bump)]
    pub listing: Account<'info, Listing>,
    #[account(init, payer = investor, space = TradeRecord::LEN,
        seeds = [b"trade", listing.key().as_ref(), investor.key().as_ref()], bump)]
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
    #[account(init, payer = seller, space = Listing::LEN,
        seeds = [b"listing", asset_mint.key().as_ref(), seller.key().as_ref()], bump)]
    pub listing: Account<'info, Listing>,
    pub asset_mint: Account<'info, Mint>,
    #[account(init, payer = seller, token::mint = asset_mint, token::authority = listing,
        seeds = [b"escrow", asset_mint.key().as_ref(), seller.key().as_ref()], bump)]
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
    #[account(mut, seeds = [b"listing", listing.asset_mint.as_ref(), listing.emitter.as_ref()],
        bump = listing.bump, has_one = emitter)]
    pub listing: Account<'info, Listing>,
    #[account(mut, seeds = [b"escrow", listing.asset_mint.as_ref(), listing.emitter.as_ref()], bump)]
    pub escrow_vault: Account<'info, TokenAccount>,
    #[account(mut)] pub seller_token_account: Account<'info, TokenAccount>,
    pub emitter: Signer<'info>,
    pub token_program: Program<'info, Token>,
}
