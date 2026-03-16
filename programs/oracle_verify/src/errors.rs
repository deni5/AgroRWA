use anchor_lang::prelude::*;

#[error_code]
pub enum OracleError {
    #[msg("Verification already signed")]
    AlreadySigned,
    #[msg("Dispute is not open")]
    DisputeNotOpen,
    #[msg("Field too long")]
    FieldTooLong,
    #[msg("Oracle not active")]
    OracleNotActive,
    #[msg("Unauthorized")]
    Unauthorized,
}
