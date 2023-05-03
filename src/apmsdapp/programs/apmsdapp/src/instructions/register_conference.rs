use crate::account_data::*;
use anchor_lang::prelude::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct RegisterConference<'info> {
  #[account(mut)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  #[account(mut)]
  pub user: Signer<'info>,
}

pub fn register_conference(ctx: Context<RegisterConference>, conferenceid:Pubkey, paper_hash: String, presenter: Registration, payment_transaction: String) -> Result<()> {
    let account = &mut ctx.accounts.conference_list;
    let index = account.get_conference_index(conferenceid)?;
    let paper_index = account.get_paper_index(index, paper_hash)?;
    let paper = &mut account.conferences.get_mut(index).ok_or(ConferenceError::ConferenceNotFound)?.paper_submitted.get_mut(paper_index).expect("");   
    paper.registration_details = presenter;
    paper.fee_paid_transaction = payment_transaction;

    Ok(())
}
