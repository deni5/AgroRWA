use anchor_lang::prelude::*;
use crate::{KycStatus, OracleRole};

/// PDA: ["emitter", wallet]
#[account]
pub struct EmitterProfile {
    pub wallet: Pubkey,
    pub legal_name: String,
    pub edrpou: String,
    pub country: String,
    pub region: String,
    pub docs_ipfs: Vec<String>,
    pub kyc_status: KycStatus,
    pub kyc_reviewer: Option<Pubkey>,
    pub kyc_reviewed_at: Option<i64>,
    pub kyc_note: String,
    /// 0-1000, starts at 500 (A rating)
    pub rating_score: u16,
    pub total_issued: u32,
    pub total_fulfilled: u32,
    pub total_defaults: u8,
    pub registered_at: i64,
    pub bump: u8,
}

impl EmitterProfile {
    pub const LEN: usize = 8
        + 32        // wallet
        + 4 + 128   // legal_name
        + 4 + 16    // edrpou
        + 4 + 4     // country
        + 4 + 64    // region
        + 4 + (5 * (4 + 128)) // docs_ipfs vec
        + 1 + 1     // kyc_status enum
        + 1 + 32    // kyc_reviewer Option
        + 1 + 8     // kyc_reviewed_at Option
        + 4 + 256   // kyc_note
        + 2         // rating_score
        + 4         // total_issued
        + 4         // total_fulfilled
        + 1         // total_defaults
        + 8         // registered_at
        + 1;        // bump

    /// Returns required deposit in basis points based on rating
    pub fn deposit_bps(&self) -> u16 {
        match self.rating_score {
            900..=1000 => 200,   // AAA: 2%
            700..=899  => 500,   // AA:  5%
            500..=699  => 800,   // A:   8%
            300..=499  => 1200,  // B:   12%
            _          => 2000,  // C:   20%
        }
    }

    pub fn rating_label(&self) -> &str {
        match self.rating_score {
            900..=1000 => "AAA",
            700..=899  => "AA",
            500..=699  => "A",
            300..=499  => "B",
            _          => "C",
        }
    }
}

/// PDA: ["oracle", wallet]
#[account]
pub struct OracleProfile {
    pub wallet: Pubkey,
    pub name: String,
    pub role: OracleRole,
    pub credentials_ipfs: String,
    pub stake_amount: u64,
    pub is_active: bool,
    pub reputation_score: u16,  // 0-1000
    pub verified_count: u32,
    pub dispute_count: u16,
    pub registered_at: i64,
    pub bump: u8,
}

impl OracleProfile {
    pub const LEN: usize = 8
        + 32        // wallet
        + 4 + 64    // name
        + 1 + 1     // role enum
        + 4 + 128   // credentials_ipfs
        + 8         // stake_amount
        + 1         // is_active
        + 2         // reputation_score
        + 4         // verified_count
        + 2         // dispute_count
        + 8         // registered_at
        + 1;        // bump

    /// Fee multiplier based on reputation (0.5x - 2.0x)
    pub fn fee_multiplier_bps(&self) -> u16 {
        match self.reputation_score {
            900..=1000 => 200,  // 2.0x
            700..=899  => 150,  // 1.5x
            500..=699  => 100,  // 1.0x
            300..=499  => 75,   // 0.75x
            _          => 50,   // 0.5x
        }
    }
}
