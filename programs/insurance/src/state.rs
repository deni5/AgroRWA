use anchor_lang::prelude::*;

/// PDA: ["fund"]
#[account]
pub struct InsuranceFund {
    pub total_balance: u64,
    pub total_paid_out: u64,
    pub active_claims: u16,
    pub bump: u8,
}

impl InsuranceFund {
    pub const LEN: usize = 8 + 8 + 8 + 2 + 1;
}

/// PDA: ["claim", claimant]
#[account]
pub struct InsuranceClaim {
    pub claimant: Pubkey,
    pub asset_mint: Pubkey,
    pub claim_amount: u64,
    pub approved_amount: u64,
    pub reason: ClaimReason,
    pub evidence_ipfs: String,
    pub status: ClaimStatus,
    pub resolution_note: String,
    pub opened_at: i64,
    pub resolved_at: Option<i64>,
    pub bump: u8,
}

impl InsuranceClaim {
    pub const LEN: usize = 8
        + 32 + 32
        + 8 + 8
        + 1 + 1
        + 4 + 256
        + 1 + 1
        + 4 + 256
        + 8
        + 1 + 8
        + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy)]
pub enum ClaimReason {
    ForceMajeure,
    EmitterFraud,
    QualityMismatch,
    NonDelivery,
    OracleMisconduct,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy)]
pub enum ClaimStatus {
    Pending,
    UnderReview,
    Approved,
    Rejected,
}
