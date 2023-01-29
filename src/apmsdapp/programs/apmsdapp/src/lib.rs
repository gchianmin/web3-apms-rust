// use std::mem::size_of;
use account_data::*;
use anchor_lang::prelude::*;
use instructions::*;

mod account_data;
mod errors;
mod instructions;

declare_id!("FwYZN1BjDu3Szoc1rUMbMyuAQFPHNxFJMo7ijWCUcPRM");

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

}