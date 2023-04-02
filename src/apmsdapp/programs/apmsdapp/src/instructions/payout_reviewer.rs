use crate::account_data::*;
use crate::errors::*;
use anchor_lang::prelude::*;

// #[derive(Accounts)]
// pub struct PayoutReviewer<'info> {
//     #[account(mut)]
//     pub conference_list: Account<'info, ConferenceListAccountData>,
//     #[account(mut)]
//     pub user: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }
#[derive(Accounts)]
pub struct TransferSolWithCpi<'info> {
    #[account(mut)]
    pub conference_list: Account<'info, ConferenceListAccountData>,
    /// CHECK: This is just an example, not checking data
    #[account(mut)]
    pub recepient: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

// #[derive(Accounts)]
// pub struct TransferSolWithCpi<'info> {
//     /// CHECK: This is just an example, not checking data
//     #[account(mut)]
//     recipient: UncheckedAccount<'info>,
//     #[account(mut)]
//     payer: Signer<'info>,
//     #[account(mut)]
//     conference_list: Account<'info, ConferenceListAccountData>,
//     system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct TransferSolWithProgram<'info> {
//     /// CHECK: This is just an example, not checking data
//     #[account(mut)]
//     recipient: UncheckedAccount<'info>,
//     /// CHECK: This is just an example, not checking data
//     #[account(mut)]
//     payer: UncheckedAccount<'info>,
//     system_program: Program<'info, System>,
// }

// pub fn payout_reviewer(ctx: Context<TransferSolWithCpi>, amount: u64) -> Result<()> {

//     system_program::transfer(
//         CpiContext::new(
//             ctx.accounts.system_program.to_account_info(),
//             system_program::Transfer {
//                 from: ctx.accounts.conference_list.to_account_info(),
//                 to: ctx.accounts.recipient.to_account_info(),
//             },
//         ),
//         amount,
//     )?;

//     Ok(())
// }

pub fn payout_reviewer(ctx: Context<TransferSolWithCpi>, conferenceid: Pubkey, recepient_wallet: Pubkey, amount: u64) -> Result<()> {
    //   let reviewers = &mut ctx.accounts.recepient;

    //   for i in recepient {
    //     reviewers.recepient.push(i);
    //     reviewers.count += 1;
    //   }

    //   for r in ctx.accounts.recepient.recepient {

    **ctx.accounts.conference_list.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.recepient.try_borrow_mut_lamports()? += amount;

    let account = &mut ctx.accounts.conference_list;
    let index = account.get_conference_index(conferenceid)?;
    let conf = account.conferences.get_mut(index).expect("");
    // let paper_index = account.get_paper_index(index, paper_hash)?;
    // let paper = &mut account.conferences.get_mut(index).ok_or(ConferenceError::ConferenceNotFound)?.paper_submitted.get_mut(paper_index).expect("");   
    for reviewer in conf.paper_submitted.iter_mut().flat_map(|paper| paper.reviewer.iter_mut()) {
         if reviewer.tpc_wallet == recepient_wallet {
            reviewer.paidout = 1;
         }

    }

    for paper in conf.paper_submitted.iter_mut() {
        if paper.paper_chair.tpc_wallet == recepient_wallet {
            paper.paper_chair.paidout = 1;
        }

   }
    

    //   }

    // let cpi_context = CpiContext::new_with_signer(
    //     ctx.accounts.system_program.to_account_info(),
    //     Transfer {
    //         from: ctx.accounts.conference_list.to_account_info(),
    //         to: ctx.accounts.recepient.clone(),
    //     },
    //     &[&pool_seeds[..]]
    // );

    // transfer(cpi_context, amount)?;

    Ok(())
}
