use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum TokenType {
    Forward,  // Future harvest
    Asset,    // Equipment / commodity
    Credit,   // Bond / loan
    Revenue,  // Revenue share
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum AssetCategory {
    Grain,
    Oilseeds,
    Livestock,
    Land,
    Equipment,
    Storage,
    Other,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum LifecycleStatus {
    Pending,     // Created, awaiting verification
    Verified,    // Oracle threshold reached
    Listed,      // On marketplace
    PartialSold, // Some tokens sold
    FullySold,   // All tokens sold
    Delivered,   // Asset delivered, confirmed by oracle
    Settled,     // Financial settlement complete
    Disputed,    // Under dispute review
    Frozen,      // Frozen by admin
    Cancelled,   // Cancelled by emitter
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum PaymentCurrency {
    USDC,
    USDT,
    SOL,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum DocType {
    Ownership,       // Право власності
    QualityReport,   // Звіт якості
    NotarialDeed,    // Нотаріальний акт
    LegalClearance,  // Юридична чистота
    Insurance,       // Страховий поліс
    WeighBridge,     // Акт зважування
    Other,
}

/// PDA: ["asset", mint]
#[account]
pub struct AssetRecord {
    pub mint: Pubkey,
    pub emitter: Pubkey,
    pub token_type: TokenType,
    pub title: String,
    pub description: String,
    pub category: AssetCategory,
    pub location_gps: String,
    pub characteristics: String,    // JSON
    pub total_supply: u64,
    pub unit: String,
    pub price_per_unit: u64,        // USDC 6 decimals
    pub currency: PaymentCurrency,
    pub delivery_date: i64,
    pub docs_ipfs: Vec<String>,
    pub lifecycle_status: LifecycleStatus,
    pub verification_count: u8,
    pub required_verifications: u8,
    pub created_at: i64,
    pub bump: u8,
}

impl AssetRecord {
    pub const LEN: usize = 8
        + 32        // mint
        + 32        // emitter
        + 1 + 1     // token_type
        + 4 + 64    // title
        + 4 + 512   // description
        + 1 + 1     // category
        + 4 + 32    // location_gps
        + 4 + 512   // characteristics JSON
        + 8         // total_supply
        + 4 + 8     // unit
        + 8         // price_per_unit
        + 1 + 1     // currency
        + 8         // delivery_date
        + 4 + (10 * (4 + 128)) // docs_ipfs
        + 1 + 1     // lifecycle_status
        + 1         // verification_count
        + 1         // required_verifications
        + 8         // created_at
        + 1;        // bump
}
