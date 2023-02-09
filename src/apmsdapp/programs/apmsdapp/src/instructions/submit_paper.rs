use crate::account_data::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SubmitPaper<'info> {
  #[account(mut)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  #[account(mut)]
  pub user: Signer<'info>,
}

pub fn submit_paper(ctx: Context<SubmitPaper>, conferenceid:Pubkey, paper_id: String, paper_authors: Author, date_submitted: String, paper_status: String, version:u8) -> Result<()> {
    let account = &mut ctx.accounts.conference_list;
    let index = account.get_conference_index(conferenceid)?;
    let conf =  &mut (account.conferences.get_mut(index).expect(""));
    let paper_admin = *ctx.accounts.user.key;
    conf.paper_submitted.push(Paper {
        paper_id,
        paper_admin,
        paper_authors,
        date_submitted,
        paper_status,
        version,
        fee_paid:0,
        reviewer:Tpc::default()
    });
    Ok(())
}