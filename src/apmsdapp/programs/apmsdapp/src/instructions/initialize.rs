use crate::account_data::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
  #[account(init, payer = user, space = 10000)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
  ctx.accounts.conference_list.set_inner(ConferenceListAccountData {
    conferences: Vec::new(),
    deleted_indexes: Vec::new(),
    count: 0,
  });
  Ok(())
}
