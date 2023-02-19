use crate::account_data::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateConference<'info> {
  #[account(mut)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  pub user: Signer<'info>,
}

pub fn create_conference(ctx: Context<CreateConference>, name: String, description: String, date: String, venue: String, submission_deadline: String, created_by: String, organiser_email: String, conference_link: String) -> Result<()> {
  let account = &mut ctx.accounts.conference_list;
  let index = match account.deleted_indexes.pop() {
    Some(value) => value,
    None => account.count,
  };
  let admin = *ctx.accounts.user.key;
  let (id, _) = Pubkey::find_program_address(&[b"conference", &[index]], ctx.program_id);
  account.count += 1;
  account.conferences.push(Conference {
    id,
    admin,
    name,
    description,
    date,
    venue,
    submission_deadline,
    paper_submitted: Vec::new(),
    fee_received: 0,
    created_by,
    organiser_email,
    technical_programs_committees: Vec::new(),
    conference_link,
  });
  Ok(())
}
