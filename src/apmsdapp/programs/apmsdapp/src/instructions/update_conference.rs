use crate::account_data::*;
use crate::errors::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateConference<'info> {
    #[account(mut)]
    pub conference_list: Account<'info, ConferenceListAccountData>,
    pub user: Signer<'info>,
}

pub fn update_conference(ctx: Context<UpdateConference>, conference: Conference) -> Result<()> {
    let account = &mut ctx.accounts.conference_list;
    let user = &mut ctx.accounts.user;
    let index = account.get_conference_index(conference.id)?;
    let conf = &mut (account.conferences.get_mut(index).expect(""));
    require!(conf.admin == *user.key, ConferenceError::NotAuthorized);
    *(account.conferences.get_mut(index).expect("")) = conference;
    Ok(())
}