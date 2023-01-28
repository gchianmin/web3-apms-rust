use crate::account_data::*;
use crate::errors::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateConference<'info> {
  #[account(mut)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  pub user: Signer<'info>,
}

pub fn update_conference(ctx: Context<UpdateConference>, conference: Conference) -> Result<()> {
  print!("enter");
  let account = &mut ctx.accounts.conference_list;
  let index = account.get_conference_index(conference.id)?;
  *(account.conferences.get_mut(index).expect("")) = conference;
  Ok(())
}
