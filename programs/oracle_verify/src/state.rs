use anchor_lang::prelude::*;
use crate::{OracleRole, Verdict, DisputeReason, DisputeResolution};

/// PDA: ["verify", asset_mint, oracle]
#[account]
pub struct VerifyRequest {
    pub asset_mint: Pubkey,
    pub emitter: Pubkey,
    pub oracle: Pubkey,
    pub required_role: OracleRole,
    pub status: VerifyStatus,
    pub verdict: Option<Verdict>,
    pub oracle_report_ipfs: String,
    pub note: String,
    pub requested_at: i64,
    pub signed_at: Option<i64>,
    pub bump: u8,
}

impl VerifyRequest {
    pub const LEN: usize = 8
        + 32        // asset_mint
        + 32        // emitter
        + 32        // oracle
        + 1 + 1     // required_role
        + 1 + 1     // status
        + 1 + 1 + 1 // verdict Option<enum>
        + 4 + 128   // oracle_report_ipfs
        + 4 + 256   // note
        + 8         // requested_at
        + 1 + 8     // signed_at Option
        + 1;        // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy)]
pub enum VerifyStatus { Requested, Signed, Rejected }

/// PDA: ["delivery", asset_mint]
#[account]
pub struct DeliveryRecord {
    pub asset_mint: Pubkey,
    pub oracle: Pubkey,
    pub delivery_report_ipfs: String,
    pub actual_amount: u64,
    pub confirmed_at: i64,
    pub bump: u8,
}

impl DeliveryRecord {
    pub const LEN: usize = 8 + 32 + 32 + (4 + 128) + 8 + 8 + 1;
}

/// PDA: ["dispute", asset_mint, claimant]
#[account]
pub struct DisputeRecord {
    pub asset_mint: Pubkey,
    pub claimant: Pubkey,
    pub reason: DisputeReason,
    pub evidence_ipfs: String,
    pub status: DisputeStatus,
    pub resolution: Option<DisputeResolution>,
    pub resolution_note: String,
    pub opened_at: i64,
    pub resolved_at: Option<i64>,
    pub bump: u8,
}

impl DisputeRecord {
    pub const LEN: usize = 8
        + 32        // asset_mint
        + 32        // claimant
        + 1 + 1     // reason
        + 4 + 256   // evidence_ipfs
        + 1 + 1     // status
        + 1 + 1 + 1 // resolution Option<enum>
        + 4 + 256   // resolution_note
        + 8         // opened_at
        + 1 + 8     // resolved_at Option
        + 1;        // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy)]
pub enum DisputeStatus { Open, UnderReview, Resolved, Closed }
