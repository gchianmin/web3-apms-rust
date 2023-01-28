// use std::mem::size_of;
use account_data::*;
use anchor_lang::prelude::*;
use instructions::*;
// use anchor_lang::solana_program::entrypoint::ProgramResult;

mod account_data;
mod errors;
mod instructions;

declare_id!("4oTVMeFwQwkUpFBwdNk2kF2Ryxv5ZQdPkdhqyH2iy8H4");

#[program]
pub mod apmsdapp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize(ctx)
    }

    pub fn create_conference(ctx: Context<CreateConference>, name: String, description: String, date: String, venue: String, submission_deadline: String, created_by: String, organiser_email: String) -> Result<()> {
        instructions::create_conference(ctx, name, description, date, venue, submission_deadline, created_by, organiser_email)
    }

    pub fn update_conference(ctx: Context<UpdateConference>, conference: Conference) -> Result<()> {
        instructions::update_conference(ctx, conference)
    }

    pub fn delete_conference(ctx: Context<DeleteConference>, id: Pubkey) -> Result<()> {
        instructions::delete_conference(ctx, id)
    }

    // pub fn create_state( ctx: Context<CreateState>) -> ProgramResult {
    //     // Get state from context
    //     let state = &mut ctx.accounts.state;
    //     // Save authority to state
    //     state.authority = ctx.accounts.authority.key();
    //     // Set conference count as 0 when initializing
    //     state.conference_count = 0;
    //     Ok(())
    // }

    // // create a conference
    // pub fn create(ctx: Context<Create>, name: String, description: String, date: String, venue: String, submission_deadline: String ) -> ProgramResult {
    //     let state = &mut ctx.accounts.state;
    //     let conference = &mut ctx.accounts.conference;
    //     conference.authority = ctx.accounts.authority.key();
    //     conference.name = name;
    //     conference.description = description;
    //     conference.date = date;
    //     conference.venue = venue;
    //     conference.submission_deadline = submission_deadline;
    //     conference.paper_submitted = 0; //put as 0 for now, to change to paper submitted object
    //     conference.fee_received = 0;
    //     conference.index = state.conference_count + 1;
    //     state.conference_count += 1;
    //     // conference.admin = *ctx.accounts.user.key;
    //     Ok(())
    // }

    // modify the details of a conference
    // pub fn modify(ctx: Context<Modify>, new_name: String, new_description: String, new_date: String, new_venue: String, new_submission_deadline: String, index: u64) -> ProgramResult {
    //     let state = &mut ctx.accounts.state;
    //     let conference = &mut ctx.accounts.conference;
    //     conference.authority = ctx.accounts.authority.key();
    //     ctx.accounts.conference.name = new_name;
    //     ctx.accounts.conference.description = new_description;
    //     ctx.accounts.conference.date = new_date;
    //     ctx.accounts.conference.venue = new_venue;
    //     ctx.accounts.conference.submission_deadline = new_submission_deadline;
    //     Ok(())
    // }

    // // cancel a conference
    // pub fn cancel(ctx: Context<Cancel>) -> ProgramResult {
    //     let conference = &mut ctx.accounts.conference;
    //     let user = &mut ctx.accounts.user;
    //     //check if the user calling this function is the admin 
    //     if conference.admin != *user.key {
    //         return Err(ProgramError::IncorrectProgramId);
    //     }
    //     let lamport: u64 = 9333360 - 890880;
    //     **conference.to_account_info().try_borrow_mut_lamports()? -= lamport;
    //     **user.to_account_info().try_borrow_mut_lamports()? += lamport;
    //     Ok(())
    // }

}
// #[derive(Accounts)]
// pub struct CreateState<'info> {
//     // Authenticating state account
//     #[account(
//         init,
//         seeds = [b"state".as_ref()],
//         bump,
//         payer = authority,
//         space = 10000
//     )]
//     pub state: Account<'info, StateAccount>,

//     // Authority (this is signer who paid transaction fee)
//     #[account(mut)]
//     pub authority: Signer<'info>,

//     /// System program
//     pub system_program: Program<'info, System>
// }

// //macro - used to indicate that this is a context
// #[derive(Accounts)]
// pub struct Create<'info> {
//     // Authenticate state account
//     #[account(mut, seeds = [b"state".as_ref()], bump)]
//     pub state: Account<'info, StateAccount>,

//     //use init here but not elsewhere because we are creating a new conference account
//     #[account[init, payer=authority, space=9000, seeds=[b"CONFERENCE".as_ref(), state.conference_count.to_be_bytes().as_ref()], bump]]
//     pub conference: Account<'info, Conference>,
    
//     //specify that the user account is mutable - we can change it
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     pub system_program: Program<'info, System>

//     // conference account needs to be a program-derived account - to send money to admin - cannot be an account controlled by any users.
//     // hence adding seeds in the conference account macro; bump is needed for solana to find an account address that is not being used yet
//     //creating account but also need to specify how the account shud look like hence the struct below
// }

// // #[derive(Accounts)]
// // pub struct Modify<'info> {
// //     #[account(mut, seeds = [b"state".as_ref()], bump)]
// //     pub state: Account<'info, StateAccount>,

// //     pub authority: Signer<'info>,
// //     #[account(mut, seeds=[b"CONFERENCE".as_ref(), state.conference_count.to_be_bytes().as_ref()], bump)]
// //     pub conference: Account<'info, Conference>,
// // }

// // #[derive(Accounts)]
// // pub struct Cancel<'info> {
// //     pub user: Signer<'info>,
// //     #[account(mut, seeds = [b"CONFERENCE", user.key().as_ref()], bump, close = user)]
// //     pub conference: Account<'info, Conference>,
    
// //     // /// CHECK: This is not dangerous
// //     // #[account(mut, signer)]
// //     // pub user: AccountInfo<'info>,
// //     // pub system_program: Program<'info, System>,
// // }

// #[account]
// pub struct Conference {
//     pub authority: Pubkey, //able to withdraw fee paid by the authors
//     pub name: String,
//     pub description: String,
//     pub date: String,
//     pub venue: String,
//     pub submission_deadline: String,
//     pub paper_submitted: u64,
//     pub fee_received: u64,
//     pub index: u64,
// }

// #[account]
// pub struct StateAccount {
//     // Signer address
//     pub authority: Pubkey,
//     pub conference_count: u64,
//     pub conferences_list: Vec<Conference>,
// }

// // impl StateAccount {
// //     pub fn get_conference_index(&self, id: Pubkey) -> Result<usize> {
// //       for (index, conf) in self.conferences_list.iter().enumerate() {
// //         if conf.id == id {
// //           return Ok(index);
// //         }
// //       }
// //     err!(ErrorCode::Deprecated)
// //     }
// //   }

// // #[derive(AnchorSerialize, AnchorDeserialize, Clone)]
// // pub struct Todo {
// //     pub id: Pubkey,  
// //     pub name: String,
// //     pub description: String,
// //     pub date: String,
// //     pub venue: String,
// //     pub submission_deadline: String,
// //     pub paper_submitted: u64,
// //     pub fee_received: u64,
// // }
