use crate::account_data::*;
use crate::errors::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ReviewPaper<'info> {
  #[account(mut)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  pub user: Signer<'info>,
}

pub fn review_paper(ctx: Context<ReviewPaper>, conferenceid: Pubkey, paper_hash: String, reviewer_email: String, chair: bool, approval: u8, feedback: String) -> Result<()> {
    let account = &mut ctx.accounts.conference_list;
    let index = account.get_conference_index(conferenceid)?;
    let paper_index = account.get_paper_index(index, paper_hash)?;
    let paper = &mut account.conferences.get_mut(index).ok_or(ConferenceError::ConferenceNotFound)?.paper_submitted.get_mut(paper_index).expect("");   

    if !chair {
        for rev in paper.reviewer.iter_mut() {
            if rev.tpc_email == reviewer_email {
                rev.tpc_wallet = ctx.accounts.user.key.to_string();
                rev.approval = approval;
                rev.feedback = feedback.clone();
            }
         }
    }

    else {
        for rev in paper.reviewer.iter() {
            if (rev.approval == 0) ||  (rev.approval == 1) {
                return err!(ConferenceError::NotReviewedByAll);
            }
         }
        paper.paper_chair.tpc_wallet = ctx.accounts.user.key.to_string();
        paper.paper_chair.approval = approval;
        paper.paper_chair.feedback = feedback;
        paper.paper_status = approval;
    }
    //TO-DO:
    // Email validation check for reviewer/chair email stored
    Ok(())
}
