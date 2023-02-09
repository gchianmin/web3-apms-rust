use crate::account_data::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateTpc<'info> {
  #[account(mut)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  pub user: Signer<'info>,
}

pub fn update_tpc(ctx: Context<UpdateTpc>, conferenceid: Pubkey, tpc: Tpc) -> Result<()> {
    let account = &mut ctx.accounts.conference_list;
    let index = account.get_conference_index(conferenceid)?;
    let conf =  &mut (account.conferences.get_mut(index).expect(""));
    conf.technical_programs_committees= tpc;
    Ok(())
}