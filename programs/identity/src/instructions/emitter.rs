use anchor_lang::prelude::*;
use crate::state::EmitterProfile;
use crate::errors::IdentityError;
use crate::{KycStatus, RatingEvent, RegisterEmitterArgs};

pub fn register(ctx: Context<RegisterEmitter>, args: RegisterEmitterArgs) -> Result<()> {
    require!(args.legal_name.len() <= 128, IdentityError::FieldTooLong);
    require!(args.edrpou.len() <= 16, IdentityError::FieldTooLong);
    require!(args.docs_ipfs.len() <= 5, IdentityError::TooManyDocs);

    let profile = &mut ctx.accounts.emitter_profile;
    let clock = Clock::get()?;

    profile.wallet = ctx.accounts.wallet.key();
    profile.legal_name = args.legal_name;
    profile.edrpou = args.edrpou;
    profile.country = args.country;
    profile.region = args.region;
    profile.docs_ipfs = args.docs_ipfs;
    profile.kyc_status = KycStatus::Pending;
    profile.kyc_reviewer = None;
    profile.kyc_reviewed_at = None;
    profile.kyc_note = String::new();
    profile.rating_score = 500; // Start at A rating
    profile.total_issued = 0;
    profile.total_fulfilled = 0;
    profile.total_defaults = 0;
    profile.registered_at = clock.unix_timestamp;
    profile.bump = ctx.bumps.emitter_profile;

    msg!("Emitter registered: {}", profile.wallet);
    Ok(())
}

pub fn review_kyc(ctx: Context<ReviewKyc>, approved: bool, note: String) -> Result<()> {
    let profile = &mut ctx.accounts.emitter_profile;
    let clock = Clock::get()?;

    profile.kyc_status = if approved { KycStatus::Approved } else { KycStatus::Rejected };
    profile.kyc_reviewer = Some(ctx.accounts.admin.key());
    profile.kyc_reviewed_at = Some(clock.unix_timestamp);
    profile.kyc_note = note;

    msg!("KYC reviewed: {} → {}", profile.wallet, approved);
    Ok(())
}

pub fn update_rating(ctx: Context<UpdateEmitterRating>, delta: i16, reason: RatingEvent) -> Result<()> {
    let profile = &mut ctx.accounts.emitter_profile;

    let new_score = (profile.rating_score as i32 + delta as i32).clamp(0, 1000) as u16;
    profile.rating_score = new_score;

    match reason {
        RatingEvent::ObligationFulfilled => profile.total_fulfilled += 1,
        RatingEvent::Default => profile.total_defaults += 1,
        _ => {}
    }

    msg!("Emitter rating updated: {} → {}", profile.wallet, profile.rating_score);
    Ok(())
}

// ─── Account structs ──────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct RegisterEmitter<'info> {
    #[account(
        init,
        payer = wallet,
        space = EmitterProfile::LEN,
        seeds = [b"emitter", wallet.key().as_ref()],
        bump
    )]
    pub emitter_profile: Account<'info, EmitterProfile>,

    #[account(mut)]
    pub wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReviewKyc<'info> {
    #[account(
        mut,
        seeds = [b"emitter", emitter_profile.wallet.as_ref()],
        bump = emitter_profile.bump
    )]
    pub emitter_profile: Account<'info, EmitterProfile>,

    /// CHECK: Platform admin wallet verified in constraint
    #[account(constraint = admin.key().to_string() == crate::PLATFORM_ADMIN_STR @ IdentityError::Unauthorized)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateEmitterRating<'info> {
    #[account(
        mut,
        seeds = [b"emitter", emitter_profile.wallet.as_ref()],
        bump = emitter_profile.bump
    )]
    pub emitter_profile: Account<'info, EmitterProfile>,

    /// CHECK: Platform admin
    #[account(constraint = admin.key().to_string() == crate::PLATFORM_ADMIN_STR @ IdentityError::Unauthorized)]
    pub admin: Signer<'info>,
}
