use anchor_lang::prelude::*;
use crate::state::OracleProfile;
use crate::errors::IdentityError;
use crate::{RegisterOracleArgs, ReputationEvent};

pub const MIN_ORACLE_STAKE: u64 = 50_000_000; // 50 USDC (6 decimals)

pub fn register(ctx: Context<RegisterOracle>, args: RegisterOracleArgs) -> Result<()> {
    require!(args.stake_amount >= MIN_ORACLE_STAKE, IdentityError::InsufficientStake);
    require!(args.name.len() <= 64, IdentityError::FieldTooLong);

    let oracle = &mut ctx.accounts.oracle_profile;
    let clock = Clock::get()?;

    oracle.wallet = ctx.accounts.wallet.key();
    oracle.name = args.name;
    oracle.role = args.role;
    oracle.credentials_ipfs = args.credentials_ipfs;
    oracle.stake_amount = args.stake_amount;
    oracle.is_active = false; // Admin must activate
    oracle.reputation_score = 500;
    oracle.verified_count = 0;
    oracle.dispute_count = 0;
    oracle.registered_at = clock.unix_timestamp;
    oracle.bump = ctx.bumps.oracle_profile;

    msg!("Oracle registered: {} awaiting activation", oracle.wallet);
    Ok(())
}

pub fn set_active(ctx: Context<SetOracleActive>, active: bool) -> Result<()> {
    ctx.accounts.oracle_profile.is_active = active;
    msg!("Oracle {} active: {}", ctx.accounts.oracle_profile.wallet, active);
    Ok(())
}

pub fn update_reputation(ctx: Context<UpdateOracleReputation>, delta: i16, event: ReputationEvent) -> Result<()> {
    let oracle = &mut ctx.accounts.oracle_profile;

    let new_score = (oracle.reputation_score as i32 + delta as i32).clamp(0, 1000) as u16;
    oracle.reputation_score = new_score;

    match event {
        ReputationEvent::VerificationCompleted => oracle.verified_count += 1,
        ReputationEvent::DisputeOpened | ReputationEvent::FraudProven => oracle.dispute_count += 1,
        _ => {}
    }

    // Deactivate if score too low
    if oracle.reputation_score < 100 {
        oracle.is_active = false;
        msg!("Oracle auto-deactivated due to low reputation: {}", oracle.wallet);
    }

    msg!("Oracle reputation updated: {} → {}", oracle.wallet, oracle.reputation_score);
    Ok(())
}

// ─── Account structs ──────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct RegisterOracle<'info> {
    #[account(
        init,
        payer = wallet,
        space = OracleProfile::LEN,
        seeds = [b"oracle", wallet.key().as_ref()],
        bump
    )]
    pub oracle_profile: Account<'info, OracleProfile>,

    #[account(mut)]
    pub wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetOracleActive<'info> {
    #[account(
        mut,
        seeds = [b"oracle", oracle_profile.wallet.as_ref()],
        bump = oracle_profile.bump
    )]
    pub oracle_profile: Account<'info, OracleProfile>,

    /// CHECK: Platform admin
    #[account(constraint = admin.key().to_string() == crate::PLATFORM_ADMIN_STR @ IdentityError::Unauthorized)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateOracleReputation<'info> {
    #[account(
        mut,
        seeds = [b"oracle", oracle_profile.wallet.as_ref()],
        bump = oracle_profile.bump
    )]
    pub oracle_profile: Account<'info, OracleProfile>,

    /// CHECK: Platform admin
    #[account(constraint = admin.key().to_string() == crate::PLATFORM_ADMIN_STR @ IdentityError::Unauthorized)]
    pub admin: Signer<'info>,
}
