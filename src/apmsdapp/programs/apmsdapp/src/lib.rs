use anchor_lang::prelude::*;
// use chrono::DateTime;
use anchor_lang::solana_program::entrypoint::ProgramResult;
declare_id!("51QHpF5dYpwRfRfLAiBShGHEKZ3hT5K1FTyoo9omKfoz");

#[program]
pub mod apmsdapp {
    use super::*;

    // create a conference
    pub fn create(ctx: Context<Create>, name: String, description: String, date: String, venue: String, submission_deadline: String ) -> ProgramResult {
        let conference = &mut ctx.accounts.conference;
        conference.name = name;
        conference.description = description;
        conference.date = date;
        conference.venue = venue;
        conference.submission_deadline = submission_deadline;
        conference.paper_submitted = 0; //put as 0 for now, to change to paper submitted object
        conference.fee_received = 0;
        conference.admin = *ctx.accounts.user.key;
        Ok(())
    }

    // modify the details of a conference
    pub fn modify(ctx: Context<Modify>, new_name: String, new_description: String, new_date: String, new_venue: String, new_submission_deadline: String) -> ProgramResult {
        ctx.accounts.conference.name = new_name;
        ctx.accounts.conference.description = new_description;
        ctx.accounts.conference.date = new_date;
        ctx.accounts.conference.venue = new_venue;
        ctx.accounts.conference.submission_deadline = new_submission_deadline;
        Ok(())
    }

    // cancel a conference
    pub fn cancel(ctx: Context<Cancel>) -> ProgramResult {
        let conference = &mut ctx.accounts.conference;
        let user = &mut ctx.accounts.user;
        //check if the user calling this function is the admin 
        if conference.admin != *user.key {
            return Err(ProgramError::IncorrectProgramId);
        }
        let lamport: u64 = 9333360 - 890880;
        **conference.to_account_info().try_borrow_mut_lamports()? -= lamport;
        **user.to_account_info().try_borrow_mut_lamports()? += lamport;
        Ok(())
    }

}

//macro - used to indicate that this is a context
#[derive(Accounts)]
pub struct Create<'info> {
    //use init here but not elsewhere because we are creating a new conference account
    #[account[init, payer=user, space=9000, seeds=[b"CONFERENCE".as_ref(), user.key().as_ref()], bump]]
    pub conference: Account<'info, Conference>,
    
    //specify that the user account is mutable - we can change it
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>

    // conference account needs to be a program-derived account - to send money to admin - cannot be an account controlled by any users.
    // hence adding seeds in the conference account macro; bump is needed for solana to find an account address that is not being used yet
    //creating account but also need to specify how the account shud look like hence the struct below
}

#[derive(Accounts)]
pub struct Modify<'info> {
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"CONFERENCE", user.key().as_ref()], bump)]
    pub conference: Account<'info, Conference>,
}

#[derive(Accounts)]
pub struct Cancel<'info> {
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"CONFERENCE", user.key().as_ref()], bump, close = user)]
    pub conference: Account<'info, Conference>,
    
    // /// CHECK: This is not dangerous
    // #[account(mut, signer)]
    // pub user: AccountInfo<'info>,
    // pub system_program: Program<'info, System>,
}

#[account]
pub struct Conference {
    pub admin: Pubkey, //able to withdraw fee paid by the authors
    pub name: String,
    pub description: String,
    pub date: String,
    pub venue: String,
    pub submission_deadline: String,
    pub paper_submitted: u64,
    pub fee_received: u64
}
