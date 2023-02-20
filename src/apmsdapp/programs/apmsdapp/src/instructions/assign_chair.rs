use crate::account_data::*;
use crate::errors::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AssignChair<'info> {
  #[account(mut)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  pub user: Signer<'info>,
}

pub fn assign_chair(ctx: Context<AssignChair>, conferenceid: Pubkey, paper_hash: String, chair: Reviewers) -> Result<()> {
    let account = &mut ctx.accounts.conference_list;
    let user = &mut ctx.accounts.user;
    let index = account.get_conference_index(conferenceid)?;
    let conf = &mut (account.conferences.get_mut(index).expect(""));
    require!(conf.admin == *user.key, ConferenceError::NotAuthorized);

    let paper_index = account.get_paper_index(index, paper_hash)?;
    let paper = &mut account.conferences.get_mut(index).ok_or(ConferenceError::ConferenceNotFound)?.paper_submitted.get_mut(paper_index).expect("");
    paper.paper_chair = chair;
    Ok(())
}
