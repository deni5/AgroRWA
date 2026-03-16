use anchor_lang::prelude::*;

#[error_code]
pub enum IdentityError {
    #[msg("KYC already approved")]
    AlreadyApproved,
    #[msg("KYC not approved — emitter cannot perform this action")]
    KycNotApproved,
    #[msg("Oracle not active")]
    OracleNotActive,
    #[msg("Insufficient oracle stake")]
    InsufficientStake,
    #[msg("String field too long")]
    FieldTooLong,
    #[msg("Too many documents — max 5")]
    TooManyDocs,
    #[msg("Unauthorized — admin only")]
    Unauthorized,
}
