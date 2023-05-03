use crate::account_data::*;
use crate::errors::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub conference_list: Account<'info, ConferenceListAccountData>,
    #[account(mut)]
    pub user: Signer<'info>,
}

pub fn withdraw(ctx: Context<Withdraw>, conferenceid:Pubkey, amount: u64) -> Result<()> {

    let account = &mut ctx.accounts.conference_list;
    let index = account.get_conference_index(conferenceid)?;
    let conf = account.conferences.get(index).expect("");
    let user = &mut ctx.accounts.user;

    require!(conf.admin == *user.key, ConferenceError::NotAuthorized);

    **account.to_account_info().try_borrow_mut_lamports()? -= amount;
    **user.to_account_info().try_borrow_mut_lamports()? += amount;

    Ok(())
}

// pub fn payout_reviewer(
//     ctx: Context<PayoutReviewer>,
//     conferenceid: Pubkey,
//     destination: &[AccountInfo],
// ) -> Result<()> {

//     let account = &ctx.accounts.conference_list;
//     let index = account.get_conference_index(conferenceid)?;
//     let conf = account.conferences.get(index).expect("");

//     //ensure only organiser can invoke payout
//     // let user = &mut ctx.accounts.user;
//     // require!(conf.admin == *user.key, ConferenceError::NotAuthorized);
//     // **ctx.accounts.conference_list.to_account_info().try_borrow_mut_lamports()? -= 2;
//     // **destination.to_account_info().try_borrow_mut_lamports()? += 2;
//     // **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? -= 1;
//     // **ctx.accounts.receiver.to_account_info().try_borrow_mut_lamports()? += 1;
//     // for reviewer in conf.paper_submitted.iter().flat_map(|paper| paper.reviewer.iter()) {
//     //     if reviewer.approval != 0 {

//     // let ix = anchor_lang::solana_program::system_instruction::transfer(
//     //     &ctx.accounts.user.key(),
//     //     &destination,
//     //     1,
//     // );

//     // // // get solana to invoke this instruction
//     // let invoke = anchor_lang::solana_program::program::invoke(
//     //     &ix,
//     //     &[
//     //         ctx.accounts.user.to_account_info(),
//     //         // ctx.accounts.conference_list.to_account_info(),
//     //         // ctx.accounts.receiver.to_account_info(),
//     //     ],
//     // );

//     // let ix2 = anchor_lang::solana_program::system_instruction::transfer(
//     //     &ctx.accounts.user.key(),
//     //     &ctx.accounts.receiver.key(),
//     //     1,
//     // );

//     // let invoke2 = anchor_lang::solana_program::program::invoke(
//     //     &ix2,
//     //     &[
//     //         ctx.accounts.user.to_account_info(),
//     //         ctx.accounts.conference_list.to_account_info(),
//     //         ctx.accounts.receiver.to_account_info(),
//     //     ],
//     // );

//     // require!(invoke.is_ok(), ConferenceError::TokenTransactionError);
//     // require!(invoke2.is_ok(), ConferenceError::TokenTransactionError);

//     //     }
//     // }

//     // for paper in conf.paper_submitted.iter() {
//     //     if paper.paper_chair.approval != 0 {

//     //         let ix = anchor_lang::solana_program::system_instruction::transfer(
//     //             &user.key(),
//     //             &paper.paper_chair.tpc_wallet.key(),
//     //             2,
//     //         );

//     //         // // get solana to invoke this instruction
//     //         // let invoke = anchor_lang::solana_program::program::invoke(
//     //         //     &ix,
//     //         //     // &[
//     //         //     //     user.to_account_info(),
//     //         //     //     destination,
//     //         //     //     ctx.accounts.conference_list.to_account_info(),
//     //         //     // ],
//     //         // );

//     //         // require!(invoke.is_ok(), ConferenceError::TokenTransactionError);

//     //     }
//     // }

//     Ok(())

// }
