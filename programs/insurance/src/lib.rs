use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("8aKuqDi4FYChNmQHMQVgtYXeJFdaX44Fj3aMkX1RjZ2m");

pub mod state;
pub mod errors;

use state::*;
use errors::InsuranceError;

pub const PLATFORM_ADMIN_STR: &str = "FWm4MDuTMWKJwdawF3VtUqWuZNi4Jq7TdJYWPnU5Yt8d";
/// 20% of oracle fees go to insurance fund
pub const ORACLE_INSURANCE_SHARE: u64 = 20;
/// Max payout: 80% of claim amount
pub const MAX_CLAIM_PCT: u64 = 80;

#[program]
pub mod insurance {
    use super::*;

    /// Initialize the global insurance fund (admin once)
    pub fn initialize_fund(ctx: Context<InitializeFund>) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        fund.total_balance = 0;
        fund.total_paid_out = 0;
        fund.active_claims = 0;
        fund.bump = ctx.bumps.fund;
        msg!("Insurance fund initialized");
        Ok(())
    }

    /// Open an insurance claim (investor after dispute confirmed)
    pub fn open_claim(
        ctx: Context<OpenClaim>,
        asset_mint: Pubkey,
        claim_amount: u64,
        reason: ClaimReason,
        evidence_ipfs: String,
    ) -> Result<()> {
        require!(claim_amount > 0, InsuranceError::ZeroAmount);

        let claim = &mut ctx.accounts.claim;
        let clock = Clock::get()?;

        claim.claimant = ctx.accounts.claimant.key();
        claim.asset_mint = asset_mint;
        claim.claim_amount = claim_amount;
        claim.approved_amount = 0;
        claim.reason = reason;
        claim.evidence_ipfs = evidence_ipfs;
        claim.status = ClaimStatus::Pending;
        claim.opened_at = clock.unix_timestamp;
        claim.resolved_at = None;
        claim.bump = ctx.bumps.claim;

        ctx.accounts.fund.active_claims += 1;

        msg!("Claim opened: {} USDC by {}", claim_amount, claim.claimant);
        Ok(())
    }

    /// Admin approves claim and pays out from fund
    pub fn approve_claim(
        ctx: Context<ApproveClaim>,
        approved_amount: u64,
        note: String,
    ) -> Result<()> {
        let claim = &mut ctx.accounts.claim;
        let fund = &mut ctx.accounts.fund;
        let clock = Clock::get()?;

        require!(claim.status == ClaimStatus::Pending, InsuranceError::ClaimNotPending);

        // Cap at MAX_CLAIM_PCT of requested amount
        let max_payout = claim.claim_amount * MAX_CLAIM_PCT / 100;
        let actual_payout = approved_amount.min(max_payout).min(fund.total_balance);

        require!(actual_payout > 0, InsuranceError::InsufficientFunds);

        // Transfer from fund vault to claimant
        let seeds = &[b"fund".as_ref(), &[fund.bump]];
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.fund_vault.to_account_info(),
                    to: ctx.accounts.claimant_payment.to_account_info(),
                    authority: fund.to_account_info(),
                },
                &[seeds],
            ),
            actual_payout,
        )?;

        claim.approved_amount = actual_payout;
        claim.status = ClaimStatus::Approved;
        claim.resolution_note = note;
        claim.resolved_at = Some(clock.unix_timestamp);

        fund.total_balance = fund.total_balance.saturating_sub(actual_payout);
        fund.total_paid_out += actual_payout;
        fund.active_claims = fund.active_claims.saturating_sub(1);

        msg!("Claim approved: {} USDC paid to {}", actual_payout, claim.claimant);
        Ok(())
    }

    /// Reject a claim
    pub fn reject_claim(ctx: Context<RejectClaim>, note: String) -> Result<()> {
        let claim = &mut ctx.accounts.claim;
        let clock = Clock::get()?;

        require!(claim.status == ClaimStatus::Pending, InsuranceError::ClaimNotPending);

        claim.status = ClaimStatus::Rejected;
        claim.resolution_note = note;
        claim.resolved_at = Some(clock.unix_timestamp);
        ctx.accounts.fund.active_claims = ctx.accounts.fund.active_claims.saturating_sub(1);

        msg!("Claim rejected: {}", claim.claimant);
        Ok(())
    }

    /// Slash oracle stake into fund (after proven fraud)
    pub fn slash_oracle(ctx: Context<SlashOracle>, amount: u64) -> Result<()> {
        let fund = &mut ctx.accounts.fund;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.oracle_stake_account.to_account_info(),
                    to: ctx.accounts.fund_vault.to_account_info(),
                    authority: ctx.accounts.admin.to_account_info(),
                },
            ),
            amount,
        )?;

        fund.total_balance += amount;
        msg!("Oracle slashed: {} USDC added to fund", amount);
        Ok(())
    }
}

// ─── Account structs ──────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeFund<'info> {
    #[account(
        init, payer = admin,
        space = InsuranceFund::LEN,
        seeds = [b"fund"],
        bump
    )]
    pub fund: Account<'info, InsuranceFund>,
    #[account(mut, constraint = admin.key().to_string() == PLATFORM_ADMIN_STR @ InsuranceError::Unauthorized)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OpenClaim<'info> {
    #[account(mut, seeds = [b"fund"], bump = fund.bump)]
    pub fund: Account<'info, InsuranceFund>,
    #[account(
        init, payer = claimant,
        space = InsuranceClaim::LEN,
        seeds = [b"claim", claimant.key().as_ref()],
        bump
    )]
    pub claim: Account<'info, InsuranceClaim>,
    #[account(mut)] pub claimant: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveClaim<'info> {
    #[account(mut, seeds = [b"fund"], bump = fund.bump)]
    pub fund: Account<'info, InsuranceFund>,
    #[account(mut, seeds = [b"claim", claim.claimant.as_ref()], bump = claim.bump)]
    pub claim: Account<'info, InsuranceClaim>,
    #[account(mut)] pub fund_vault: Account<'info, TokenAccount>,
    #[account(mut)] pub claimant_payment: Account<'info, TokenAccount>,
    #[account(constraint = admin.key().to_string() == PLATFORM_ADMIN_STR @ InsuranceError::Unauthorized)]
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RejectClaim<'info> {
    #[account(mut, seeds = [b"fund"], bump = fund.bump)]
    pub fund: Account<'info, InsuranceFund>,
    #[account(mut, seeds = [b"claim", claim.claimant.as_ref()], bump = claim.bump)]
    pub claim: Account<'info, InsuranceClaim>,
    #[account(constraint = admin.key().to_string() == PLATFORM_ADMIN_STR @ InsuranceError::Unauthorized)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct SlashOracle<'info> {
    #[account(mut, seeds = [b"fund"], bump = fund.bump)]
    pub fund: Account<'info, InsuranceFund>,
    #[account(mut)] pub fund_vault: Account<'info, TokenAccount>,
    #[account(mut)] pub oracle_stake_account: Account<'info, TokenAccount>,
    #[account(constraint = admin.key().to_string() == PLATFORM_ADMIN_STR @ InsuranceError::Unauthorized)]
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
}
