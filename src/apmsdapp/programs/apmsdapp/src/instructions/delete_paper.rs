use crate::account_data::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeletePaper<'info> {
  #[account(mut)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  #[account(mut)]
  pub user: Signer<'info>,
}

pub fn delete_paper(ctx: Context<DeletePaper>, conferenceid:Pubkey, paper_id: String) -> Result<()> {
    let account = &mut ctx.accounts.conference_list;
    let index = account.get_conference_index(conferenceid)?;
    let conf =  &mut (account.conferences.get_mut(index).expect(""));
    conf.paper_submitted.remove(conf.paper_submitted.iter().position(|x| *x.paper_id == paper_id).expect("not found"));
    Ok(())
}