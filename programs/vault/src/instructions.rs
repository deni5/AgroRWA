use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer, Burn};
use anchor_spl::associated_token::AssociatedToken;
use crate::errors::VaultError;
use crate::LOCK_DURATION;

/// PDA: ["vault_deposit", user, lp_mint]
#[account]
pub struct VaultDeposit {
    /// User who deposited
    pub user: Pubkey,
    /// LP token mint that was deposited
    pub lp_mint: Pubkey,
    /// Amount of LP tokens locked
    pub amount: u64,
    /// Unix timestamp when tokens unlock
    pub unlock_time: i64,
    /// Whether this deposit has been redeemed
    pub redeemed: bool,
    /// Bump for PDA
    pub bump: u8,
}

impl VaultDeposit {
    pub const LEN: usize = 8
        + 32  // user
        + 32  // lp_mint
        + 8   // amount
        + 8   // unlock_time
        + 1   // redeemed
        + 1;  // bump
}

// ─── deposit_lp ──────────────────────────────────────────────────────────────

pub fn deposit_lp(ctx: Context<DepositLp>, amount: u64) -> Result<()> {
    require!(amount > 0, VaultError::ZeroAmount);

    let clock = Clock::get()?;
    let deposit = &mut ctx.accounts.vault_deposit;

    deposit.user = ctx.accounts.user.key();
    deposit.lp_mint = ctx.accounts.lp_mint.key();
    deposit.amount = amount;
    deposit.unlock_time = clock.unix_timestamp + LOCK_DURATION;
    deposit.redeemed = false;
    deposit.bump = ctx.bumps.vault_deposit;

    // Transfer LP tokens from user to vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_lp_account.to_account_info(),
                to: ctx.accounts.vault_lp_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
    )?;

    // Mint receipt tokens 1:1
    let seeds = &[
        b"receipt_authority",
        ctx.accounts.lp_mint.key().as_ref(),
        &[ctx.bumps.receipt_authority],
    ];
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.receipt_mint.to_account_info(),
                to: ctx.accounts.user_receipt_account.to_account_info(),
                authority: ctx.accounts.receipt_authority.to_account_info(),
            },
            &[seeds],
        ),
        amount,
    )?;

    msg!("Deposited {} LP, unlocks at {}", amount, deposit.unlock_time);
    Ok(())
}

// ─── redeem_lp ───────────────────────────────────────────────────────────────

pub fn redeem_lp(ctx: Context<RedeemLp>) -> Result<()> {
    let clock = Clock::get()?;
    let deposit = &mut ctx.accounts.vault_deposit;

    require!(!deposit.redeemed, VaultError::AlreadyRedeemed);
    require!(clock.unix_timestamp >= deposit.unlock_time, VaultError::StillLocked);

    let amount = deposit.amount;
    deposit.redeemed = true;

    // Burn receipt tokens
    let seeds = &[
        b"receipt_authority",
        ctx.accounts.lp_mint.key().as_ref(),
        &[ctx.bumps.receipt_authority],
    ];
    token::burn(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.receipt_mint.to_account_info(),
                from: ctx.accounts.user_receipt_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
            &[seeds],
        ),
        amount,
    )?;

    // Return LP tokens to user
    let vault_seeds = &[
        b"vault_lp",
        ctx.accounts.lp_mint.key().as_ref(),
        &[ctx.bumps.vault_lp_account],
    ];
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_lp_account.to_account_info(),
                to: ctx.accounts.user_lp_account.to_account_info(),
                authority: ctx.accounts.vault_lp_account.to_account_info(),
            },
            &[vault_seeds],
        ),
        amount,
    )?;

    msg!("Redeemed {} LP tokens", amount);
    Ok(())
}

// ─── Account structs ─────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct DepositLp<'info> {
    #[account(
        init,
        payer = user,
        space = VaultDeposit::LEN,
        seeds = [b"vault_deposit", user.key().as_ref(), lp_mint.key().as_ref()],
        bump
    )]
    pub vault_deposit: Account<'info, VaultDeposit>,

    pub lp_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"receipt_mint", lp_mint.key().as_ref()],
        bump
    )]
    pub receipt_mint: Account<'info, Mint>,

    /// CHECK: PDA that is authority for receipt_mint
    #[account(seeds = [b"receipt_authority", lp_mint.key().as_ref()], bump)]
    pub receipt_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"vault_lp", lp_mint.key().as_ref()],
        bump,
        token::mint = lp_mint,
        token::authority = vault_lp_account
    )]
    pub vault_lp_account: Account<'info, TokenAccount>,

    #[account(mut, token::mint = lp_mint, token::authority = user)]
    pub user_lp_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = receipt_mint,
        associated_token::authority = user
    )]
    pub user_receipt_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RedeemLp<'info> {
    #[account(
        mut,
        seeds = [b"vault_deposit", user.key().as_ref(), lp_mint.key().as_ref()],
        bump = vault_deposit.bump,
        has_one = user
    )]
    pub vault_deposit: Account<'info, VaultDeposit>,

    pub lp_mint: Account<'info, Mint>,

    #[account(mut, seeds = [b"receipt_mint", lp_mint.key().as_ref()], bump)]
    pub receipt_mint: Account<'info, Mint>,

    /// CHECK: PDA authority
    #[account(seeds = [b"receipt_authority", lp_mint.key().as_ref()], bump)]
    pub receipt_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"vault_lp", lp_mint.key().as_ref()],
        bump
    )]
    pub vault_lp_account: Account<'info, TokenAccount>,

    #[account(mut, token::mint = receipt_mint, token::authority = user)]
    pub user_receipt_account: Account<'info, TokenAccount>,

    #[account(mut, token::mint = lp_mint, token::authority = user)]
    pub user_lp_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
