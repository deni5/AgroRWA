use anchor_lang::prelude::*;

#[error_code]
pub enum AssetError {
    #[msg("Field value too long")]
    FieldTooLong,
    #[msg("Too many documents — max 10")]
    TooManyDocs,
    #[msg("Asset is not in correct status for this action")]
    InvalidStatus,
    #[msg("Emitter KYC not approved")]
    EmitterNotApproved,
    #[msg("Unauthorized")]
    Unauthorized,
}
