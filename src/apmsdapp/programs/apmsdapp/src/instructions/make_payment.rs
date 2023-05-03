use crate::account_data::*;
use crate::errors::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct MakePayment<'info> {
    #[account(mut)]
    pub conference_list: Account<'info, ConferenceListAccountData>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn make_payment(
    ctx: Context<MakePayment>,
    conferenceid: Pubkey,
    paper_hash: String,
    amount: u64,
    payment_date:String,
    presenter: Registration,
) -> Result<()> {
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.user.key(),
        &ctx.accounts.conference_list.key(),
        amount,
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

    let account = &mut ctx.accounts.conference_list;
    let index = account.get_conference_index(conferenceid)?;
    let paper_index = account.get_paper_index(index, paper_hash)?;
    let conf = &mut (account.conferences.get_mut(index).expect(""));
    conf.fee_received += amount;
    let paper = conf.paper_submitted.get_mut(paper_index).expect("");

    paper.fee_paid = amount;
    paper.paper_status = 8;
    paper.fee_paid_datetime = payment_date;
    paper.registration_details = presenter;
    

    Ok(())
}
