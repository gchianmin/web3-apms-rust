use crate::account_data::*;
use crate::errors::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct PayoutReviewer<'info> {
    #[account(mut)]
    pub conference_list: Account<'info, ConferenceListAccountData>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn payout_reviewer(
    ctx: Context<PayoutReviewer>,
    conferenceid: Pubkey,
) -> Result<()> {

    let account = &ctx.accounts.conference_list;
    let index = account.get_conference_index(conferenceid)?;
    let conf = account.conferences.get(index).expect("");

    //ensure only organiser can invoke payout
    let user = &mut ctx.accounts.user;
    require!(conf.admin != *user.key, ConferenceError::NotAuthorized);

    for reviewer in conf.paper_submitted.iter().flat_map(|paper| paper.reviewer.iter()) {

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &reviewer.tpc_wallet.key(),
            &ctx.accounts.conference_list.key(),
            2,
        );
    
        // get solana to invoke this instruction
        let invoke = anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.conference_list.to_account_info(),
            ],
        );
    
        require!(invoke.is_ok(), ConferenceError::TokenTransactionError);

    }
    
    Ok(())
  
}
