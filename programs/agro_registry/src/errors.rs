use anchor_lang::prelude::*;

#[error_code]
pub enum RegistryError {
    #[msg("Title must be 64 characters or less")]
    TitleTooLong,
    #[msg("Description must be 256 characters or less")]
    DescriptionTooLong,
    #[msg("Logo URL must be 128 characters or less")]
    LogoUrlTooLong,
    #[msg("Unauthorized: only the creator can update this asset")]
    Unauthorized,
}
