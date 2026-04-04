use anchor_lang::prelude::*;


declare_id!("Ht3HSrZqmja6tePjE1xipHuSPGBpv6JATktSSxacy5Mn");

pub mod state;
pub mod errors;
pub mod instructions;

use instructions::*;

pub const PLATFORM_ADMIN_STR: &str = "FWm4MDuTMWKJwdawF3VtUqWuZNi4Jq7TdJYWPnU5Yt8d";

#[program]
pub mod identity {
    use super::*;

    pub fn register_emitter(ctx: Context<RegisterEmitter>, args: RegisterEmitterArgs) -> Result<()> {
        instructions::emitter::register(ctx, args)
    }
    pub fn review_kyc(ctx: Context<ReviewKyc>, approved: bool, note: String) -> Result<()> {
        instructions::emitter::review_kyc(ctx, approved, note)
    }
    pub fn update_emitter_rating(ctx: Context<UpdateEmitterRating>, delta: i16, reason: RatingEvent) -> Result<()> {
        instructions::emitter::update_rating(ctx, delta, reason)
    }
    pub fn register_oracle(ctx: Context<RegisterOracle>, args: RegisterOracleArgs) -> Result<()> {
        instructions::oracle::register(ctx, args)
    }
    pub fn set_oracle_active(ctx: Context<SetOracleActive>, active: bool) -> Result<()> {
        instructions::oracle::set_active(ctx, active)
    }
    pub fn update_oracle_reputation(ctx: Context<UpdateOracleReputation>, delta: i16, event: ReputationEvent) -> Result<()> {
        instructions::oracle::update_reputation(ctx, delta, event)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum KycStatus { Pending, Approved, Rejected, Suspended }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum OracleRole { AgroExpert, Notary, LegalAdvisor, Auditor }

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum RatingEvent {
    ObligationFulfilled, EarlyFulfillment, LateDelivery,
    Default, DisputeOpened, FraudProven,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ReputationEvent {
    VerificationCompleted, DeliveryConfirmed,
    DisputeOpened, FraudProven, Cancellation,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RegisterEmitterArgs {
    pub legal_name: String,
    pub edrpou: String,
    pub country: String,
    pub region: String,
    pub docs_ipfs: Vec<String>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RegisterOracleArgs {
    pub name: String,
    pub role: OracleRole,
    pub credentials_ipfs: String,
    pub stake_amount: u64,
}
