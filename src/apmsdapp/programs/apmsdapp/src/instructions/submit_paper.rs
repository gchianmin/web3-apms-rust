use crate::account_data::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SubmitPaper<'info> {
  #[account(mut)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  #[account(mut)]
  pub user: Signer<'info>,
}

pub fn submit_paper(ctx: Context<SubmitPaper>, conferenceid:Pubkey, paper_id: String, paper_hash: String, paper_name:String, paper_title: String, paper_abstract: String, paper_authors: Vec<Author>, date_submitted: String, version:u8, prev_version:String) -> Result<()> {
    let account = &mut ctx.accounts.conference_list;
    let index = account.get_conference_index(conferenceid)?;
    let conf =  &mut (account.conferences.get_mut(index).expect(""));
    let paper_admin = *ctx.accounts.user.key;

    conf.paper_submitted.push(Paper {
        paper_id,
        paper_hash,
        paper_admin,
        paper_name,
        paper_title,
        paper_abstract,
        paper_authors,
        date_submitted,
        paper_status:0,
        version,
        prev_version,
        fee_paid:0,
        reviewer:Vec::new(),
        paper_chair:Reviewers::default(),
    });
    Ok(())
}