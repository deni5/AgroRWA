use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer, Burn};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::Pool;
use crate::errors::PoolError;

const DEFAULT_FEE_BPS: u16 = 30; // 0.30%

// ─── create_pool ─────────────────────────────────────────────────────────────

pub fn create_pool(ctx: Context<CreatePool>) -> Result<()> {
    let token_a = ctx.accounts.token_a_mint.key();
    let token_b = ctx.accounts.token_b_mint.key();
    require!(token_a != token_b, PoolError::SameTokens);
    // Enforce sorted order so (A,B) and (B,A) map to same PDA
    require!(token_a < token_b, PoolError::UnsortedTokens);

    let pool = &mut ctx.accounts.pool;
    let clock = Clock::get()?;

    pool.token_a_mint = token_a;
    pool.token_b_mint = token_b;
    pool.vault_a = ctx.accounts.vault_a.key();
    pool.vault_b = ctx.accounts.vault_b.key();
    pool.lp_mint = ctx.accounts.lp_mint.key();
    pool.creator = ctx.accounts.creator.key();
    pool.reserve_a = 0;
    pool.reserve_b = 0;
    pool.lp_supply = 0;
    pool.fee_bps = DEFAULT_FEE_BPS;
    pool.created_at = clock.unix_timestamp;
    pool.bump = ctx.bumps.pool;

    msg!("Pool created: {}/{}", token_a, token_b);
    Ok(())
}

// ─── add_liquidity ───────────────────────────────────────────────────────────

pub fn add_liquidity(
    ctx: Context<AddLiquidity>,
    amount_a: u64,
    amount_b: u64,
    min_lp_out: u64,
) -> Result<()> {
    require!(amount_a > 0 && amount_b > 0, PoolError::ZeroAmount);

    let pool = &mut ctx.accounts.pool;
    let lp_to_mint = pool.calc_lp_to_mint(amount_a, amount_b)
        .ok_or(PoolError::MathOverflow)?;
    require!(lp_to_mint >= min_lp_out, PoolError::SlippageExceeded);

    // Transfer token A from user to vault A
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_a.to_account_info(),
                to: ctx.accounts.vault_a.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount_a,
    )?;

    // Transfer token B from user to vault B
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_b.to_account_info(),
                to: ctx.accounts.vault_b.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount_b,
    )?;

    // Mint LP tokens to user
    let seeds = &[
        b"pool",
        pool.token_a_mint.as_ref(),
        pool.token_b_mint.as_ref(),
        &[pool.bump],
    ];
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.lp_mint.to_account_info(),
                to: ctx.accounts.user_lp_account.to_account_info(),
                authority: ctx.accounts.pool.to_account_info(),
            },
            &[seeds],
        ),
        lp_to_mint,
    )?;

    pool.reserve_a = pool.reserve_a.checked_add(amount_a).ok_or(PoolError::MathOverflow)?;
    pool.reserve_b = pool.reserve_b.checked_add(amount_b).ok_or(PoolError::MathOverflow)?;
    pool.lp_supply = pool.lp_supply.checked_add(lp_to_mint).ok_or(PoolError::MathOverflow)?;

    msg!("Liquidity added: {} A, {} B, {} LP minted", amount_a, amount_b, lp_to_mint);
    Ok(())
}

// ─── remove_liquidity ────────────────────────────────────────────────────────

pub fn remove_liquidity(
    ctx: Context<RemoveLiquidity>,
    lp_amount: u64,
    min_a_out: u64,
    min_b_out: u64,
) -> Result<()> {
    require!(lp_amount > 0, PoolError::ZeroAmount);
    let pool = &mut ctx.accounts.pool;
    require!(pool.lp_supply > 0, PoolError::EmptyPool);

    let amount_a = (lp_amount as u128)
        .checked_mul(pool.reserve_a as u128).ok_or(PoolError::MathOverflow)?
        .checked_div(pool.lp_supply as u128).ok_or(PoolError::MathOverflow)? as u64;
    let amount_b = (lp_amount as u128)
        .checked_mul(pool.reserve_b as u128).ok_or(PoolError::MathOverflow)?
        .checked_div(pool.lp_supply as u128).ok_or(PoolError::MathOverflow)? as u64;

    require!(amount_a >= min_a_out, PoolError::SlippageExceeded);
    require!(amount_b >= min_b_out, PoolError::SlippageExceeded);

    // Burn LP tokens
    let seeds = &[
        b"pool",
        pool.token_a_mint.as_ref(),
        pool.token_b_mint.as_ref(),
        &[pool.bump],
    ];
    token::burn(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.lp_mint.to_account_info(),
                from: ctx.accounts.user_lp_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
            &[seeds],
        ),
        lp_amount,
    )?;

    // Transfer tokens back to user (pool PDA is vault authority)
    let transfer_a = Transfer {
        from: ctx.accounts.vault_a.to_account_info(),
        to: ctx.accounts.user_token_a.to_account_info(),
        authority: ctx.accounts.pool.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), transfer_a, &[seeds]),
        amount_a,
    )?;

    let transfer_b = Transfer {
        from: ctx.accounts.vault_b.to_account_info(),
        to: ctx.accounts.user_token_b.to_account_info(),
        authority: ctx.accounts.pool.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), transfer_b, &[seeds]),
        amount_b,
    )?;

    pool.reserve_a -= amount_a;
    pool.reserve_b -= amount_b;
    pool.lp_supply -= lp_amount;

    Ok(())
}

// ─── swap ────────────────────────────────────────────────────────────────────

pub fn swap(
    ctx: Context<Swap>,
    amount_in: u64,
    min_amount_out: u64,
    a_to_b: bool,
) -> Result<()> {
    require!(amount_in > 0, PoolError::ZeroAmount);
    let pool = &mut ctx.accounts.pool;

    let amount_out = pool.get_amount_out(amount_in, a_to_b)
        .ok_or(PoolError::MathOverflow)?;
    require!(amount_out >= min_amount_out, PoolError::SlippageExceeded);
    require!(amount_out > 0, PoolError::ZeroOutput);

    let seeds = &[
        b"pool",
        pool.token_a_mint.as_ref(),
        pool.token_b_mint.as_ref(),
        &[pool.bump],
    ];

    if a_to_b {
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.user_token_in.to_account_info(),
            to: ctx.accounts.vault_in.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        }), amount_in)?;
        token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.vault_out.to_account_info(),
            to: ctx.accounts.user_token_out.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        }, &[seeds]), amount_out)?;
        pool.reserve_a += amount_in;
        pool.reserve_b -= amount_out;
    } else {
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.user_token_in.to_account_info(),
            to: ctx.accounts.vault_in.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        }), amount_in)?;
        token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.vault_out.to_account_info(),
            to: ctx.accounts.user_token_out.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        }, &[seeds]), amount_out)?;
        pool.reserve_b += amount_in;
        pool.reserve_a -= amount_out;
    }

    msg!("Swap: {} in → {} out (a_to_b: {})", amount_in, amount_out, a_to_b);
    Ok(())
}

// ─── Account structs ─────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct CreatePool<'info> {
    #[account(
        init,
        payer = creator,
        space = Pool::LEN,
        seeds = [b"pool", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,

    pub token_a_mint: Account<'info, Mint>,
    pub token_b_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = creator,
        token::mint = token_a_mint,
        token::authority = pool,
        seeds = [b"vault_a", pool.key().as_ref()],
        bump
    )]
    pub vault_a: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = creator,
        token::mint = token_b_mint,
        token::authority = pool,
        seeds = [b"vault_b", pool.key().as_ref()],
        bump
    )]
    pub vault_b: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = creator,
        mint::decimals = 6,
        mint::authority = pool,
        seeds = [b"lp_mint", pool.key().as_ref()],
        bump
    )]
    pub lp_mint: Account<'info, Mint>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(mut, seeds = [b"vault_a", pool.key().as_ref()], bump)]
    pub vault_a: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"vault_b", pool.key().as_ref()], bump)]
    pub vault_b: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"lp_mint", pool.key().as_ref()], bump)]
    pub lp_mint: Account<'info, Mint>,

    #[account(mut, token::mint = pool.token_a_mint, token::authority = user)]
    pub user_token_a: Account<'info, TokenAccount>,
    #[account(mut, token::mint = pool.token_b_mint, token::authority = user)]
    pub user_token_b: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = lp_mint,
        associated_token::authority = user
    )]
    pub user_lp_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(mut, seeds = [b"vault_a", pool.key().as_ref()], bump)]
    pub vault_a: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"vault_b", pool.key().as_ref()], bump)]
    pub vault_b: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"lp_mint", pool.key().as_ref()], bump)]
    pub lp_mint: Account<'info, Mint>,

    #[account(mut, token::mint = pool.token_a_mint, token::authority = user)]
    pub user_token_a: Account<'info, TokenAccount>,
    #[account(mut, token::mint = pool.token_b_mint, token::authority = user)]
    pub user_token_b: Account<'info, TokenAccount>,
    #[account(mut, token::mint = lp_mint, token::authority = user)]
    pub user_lp_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(mut, seeds = [b"vault_a", pool.key().as_ref()], bump)]
    pub vault_in: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"vault_b", pool.key().as_ref()], bump)]
    pub vault_out: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_in: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_out: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
