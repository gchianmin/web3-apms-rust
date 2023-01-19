use crate::account_data::*;
use crate::errors::*;
use anchor_lang::prelude::*;
// use anchor_lang::solana_program::entrypoint::ProgramResult;

#[derive(Accounts)]
pub struct CreateConference<'info> {
  #[account(mut)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  pub user: Signer<'info>,
}

pub fn create_conference(ctx: Context<CreateConference>, name: String, description: String, date: String, venue: String, submission_deadline: String) -> Result<()> {
  let account = &mut ctx.accounts.conference_list;
  let index = match account.deleted_indexes.pop() {
    Some(value) => value,
    None => account.count,
  };
  let (id, _) = Pubkey::find_program_address(&[b"conference", &[index]], ctx.program_id);
  account.count += 1;
  account.conferences.push(Conference {
    id,
    name,
    description,
    date,
    venue,
    submission_deadline,
    paper_submitted: 0,
    fee_received: 0,
  });
  Ok(())
}
