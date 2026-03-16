use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum ListingStatus { Active, Filled, Cancelled, Expired }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum ListingType { Primary, Secondary }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum PaymentCurrency { USDC, USDT, SOL }

/// PDA: ["listing", asset_mint, emitter]
#[account]
pub struct Listing {
    pub asset_mint: Pubkey,
    pub emitter: Pubkey,
    pub escrow_vault: Pubkey,
    pub amount: u64,
    pub amount_remaining: u64,
    pub price_per_unit: u64,
    pub currency: PaymentCurrency,
    pub min_lot: u64,
    pub listing_type: ListingType,
    pub status: ListingStatus,
    pub created_at: i64,
    pub expires_at: Option<i64>,
    pub bump: u8,
}

impl Listing {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 1 + 8 + 1 + 1 + 8 + 9 + 1;
}

/// PDA: ["trade", listing, buyer]
#[account]
pub struct TradeRecord {
    pub listing: Pubkey,
    pub asset_mint: Pubkey,
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub amount: u64,
    pub price_per_unit: u64,
    pub total_payment: u64,
    pub platform_fee: u64,
    pub insurance_fee: u64,
    pub oracle_fee: u64,
    pub traded_at: i64,
    pub bump: u8,
}

impl TradeRecord {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 1;
}
