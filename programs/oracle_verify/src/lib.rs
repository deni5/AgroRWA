use anchor_lang::prelude::*;

declare_id!("AgroOracleFWm4MDuTMWKJwdawF3VtUqWuZNi4Jq7TdJYWPnU5Yt8d11");

pub mod state;
pub mod errors;

use state::*;
use errors::OracleError;

#[program]
pub mod oracle_verify {
    use super::*;

    /// Request verification for an asset (emitter calls)
    pub fn request_verification(
        ctx: Context<RequestVerification>,
        required_role: OracleRole,
        note: String,
    ) -> Result<()> {
        let req = &mut ctx.accounts.verify_request;
        let clock = Clock::get()?;

        req.asset_mint = ctx.accounts.asset_mint.key();
        req.emitter = ctx.accounts.emitter.key();
        req.oracle = ctx.accounts.oracle.key();
        req.required_role = required_role;
        req.status = VerifyStatus::Requested;
        req.note = note;
        req.oracle_report_ipfs = String::new();
        req.verdict = None;
        req.requested_at = clock.unix_timestamp;
        req.signed_at = None;
        req.bump = ctx.bumps.verify_request;

        msg!("Verification requested for asset: {}", req.asset_mint);
        Ok(())
    }

    /// Oracle signs verification with verdict and report
    pub fn sign_verification(
        ctx: Context<SignVerification>,
        verdict: Verdict,
        report_ipfs: String,
        note: String,
    ) -> Result<()> {
        let req = &mut ctx.accounts.verify_request;
        let clock = Clock::get()?;

        require!(req.status == VerifyStatus::Requested, OracleError::AlreadySigned);
        require!(report_ipfs.len() <= 128, OracleError::FieldTooLong);

        req.status = VerifyStatus::Signed;
        req.verdict = Some(verdict.clone());
        req.oracle_report_ipfs = report_ipfs;
        req.note = note;
        req.signed_at = Some(clock.unix_timestamp);

        msg!("Oracle signed verification: verdict={:?}", verdict as u8);
        Ok(())
    }

    /// Oracle confirms physical delivery of asset
    pub fn confirm_delivery(
        ctx: Context<ConfirmDelivery>,
        delivery_report_ipfs: String,
        actual_amount: u64,
    ) -> Result<()> {
        let record = &mut ctx.accounts.delivery_record;
        let clock = Clock::get()?;

        record.asset_mint = ctx.accounts.asset_mint.key();
        record.oracle = ctx.accounts.oracle.key();
        record.delivery_report_ipfs = delivery_report_ipfs;
        record.actual_amount = actual_amount;
        record.confirmed_at = clock.unix_timestamp;
        record.bump = ctx.bumps.delivery_record;

        msg!("Delivery confirmed: {} units of {}", actual_amount, record.asset_mint);
        Ok(())
    }

    /// Open a dispute (investor calls)
    pub fn open_dispute(
        ctx: Context<OpenDispute>,
        reason: DisputeReason,
        evidence_ipfs: String,
    ) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute_record;
        let clock = Clock::get()?;

        dispute.asset_mint = ctx.accounts.asset_mint.key();
        dispute.claimant = ctx.accounts.claimant.key();
        dispute.reason = reason;
        dispute.evidence_ipfs = evidence_ipfs;
        dispute.status = DisputeStatus::Open;
        dispute.opened_at = clock.unix_timestamp;
        dispute.resolved_at = None;
        dispute.resolution = None;
        dispute.bump = ctx.bumps.dispute_record;

        msg!("Dispute opened for asset: {}", dispute.asset_mint);
        Ok(())
    }

    /// Admin resolves dispute
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        resolution: DisputeResolution,
        note: String,
    ) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute_record;
        let clock = Clock::get()?;

        require!(dispute.status == DisputeStatus::Open, OracleError::DisputeNotOpen);
        dispute.status = DisputeStatus::Resolved;
        dispute.resolution = Some(resolution);
        dispute.resolved_at = Some(clock.unix_timestamp);
        dispute.resolution_note = note;

        msg!("Dispute resolved: {:?}", resolution as u8);
        Ok(())
    }
}

// ─── Shared enums ─────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum OracleRole { AgroExpert, Notary, LegalAdvisor, Auditor }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum Verdict { Approved, Rejected, ConditionallyApproved }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum DisputeReason {
    QualityMismatch, QuantityShortfall, NonDelivery,
    DocumentFraud, PriceMismatch, Other,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum DisputeResolution {
    FavorClaimant, FavorEmitter, PartialRefund, Arbitration,
}

// ─── Account structs ──────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct RequestVerification<'info> {
    #[account(
        init,
        payer = emitter,
        space = VerifyRequest::LEN,
        seeds = [b"verify", asset_mint.key().as_ref(), oracle.key().as_ref()],
        bump
    )]
    pub verify_request: Account<'info, VerifyRequest>,

    /// CHECK: Asset mint pubkey
    pub asset_mint: AccountInfo<'info>,
    /// CHECK: Oracle wallet
    pub oracle: AccountInfo<'info>,

    #[account(mut)]
    pub emitter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SignVerification<'info> {
    #[account(
        mut,
        seeds = [b"verify", verify_request.asset_mint.as_ref(), oracle.key().as_ref()],
        bump = verify_request.bump,
        has_one = oracle
    )]
    pub verify_request: Account<'info, VerifyRequest>,
    pub oracle: Signer<'info>,
}

#[derive(Accounts)]
pub struct ConfirmDelivery<'info> {
    #[account(
        init,
        payer = oracle,
        space = DeliveryRecord::LEN,
        seeds = [b"delivery", asset_mint.key().as_ref()],
        bump
    )]
    pub delivery_record: Account<'info, DeliveryRecord>,

    /// CHECK: Asset mint
    pub asset_mint: AccountInfo<'info>,

    #[account(mut)]
    pub oracle: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OpenDispute<'info> {
    #[account(
        init,
        payer = claimant,
        space = DisputeRecord::LEN,
        seeds = [b"dispute", asset_mint.key().as_ref(), claimant.key().as_ref()],
        bump
    )]
    pub dispute_record: Account<'info, DisputeRecord>,

    /// CHECK: Asset mint
    pub asset_mint: AccountInfo<'info>,

    #[account(mut)]
    pub claimant: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(
        mut,
        seeds = [b"dispute", dispute_record.asset_mint.as_ref(), dispute_record.claimant.as_ref()],
        bump = dispute_record.bump
    )]
    pub dispute_record: Account<'info, DisputeRecord>,
    pub admin: Signer<'info>,
}
