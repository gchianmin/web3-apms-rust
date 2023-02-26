use crate::account_data::*;
use crate::errors::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AssignReviewer<'info> {
  #[account(mut)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  pub user: Signer<'info>,
}

pub fn assign_reviewer(ctx: Context<AssignReviewer>, conferenceid: Pubkey, paper_hash: String, reviewer: Vec<Reviewers>, chair: Reviewers) -> Result<()> {
    let account = &mut ctx.accounts.conference_list;
    let user = &mut ctx.accounts.user;
    let index = account.get_conference_index(conferenceid)?;
    let conf = &mut (account.conferences.get_mut(index).expect(""));
    require!(conf.admin == *user.key, ConferenceError::NotAuthorized);

    let paper_index = account.get_paper_index(index, paper_hash)?;
    let paper = &mut account.conferences.get_mut(index).ok_or(ConferenceError::ConferenceNotFound)?.paper_submitted.get_mut(paper_index).expect("");    
    paper.reviewer = reviewer;
    paper.paper_chair = chair;
    Ok(())
}
