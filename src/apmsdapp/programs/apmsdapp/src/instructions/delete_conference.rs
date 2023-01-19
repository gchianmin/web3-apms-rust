use crate::account_data::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteConference<'info> {
  #[account(mut)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  pub user: Signer<'info>,
}

pub fn delete_conference(ctx: Context<DeleteConference>, id: Pubkey) -> Result<()> {
  let account = &mut ctx.accounts.conference_list;
  let index = account.get_conference_index(id)?;
  account.conferences.remove(index);
  account.deleted_indexes.push(index as u8);
  account.count -= 1;
  Ok(())
}
