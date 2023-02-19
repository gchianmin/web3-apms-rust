use account_data::*;
use anchor_lang::prelude::*;
use instructions::*;

mod account_data;
mod errors;
mod instructions;

declare_id!("7VcDbEGMS6hvjMPMVhDzEncpxQ8LnDjLDXEMDXZD5nBJ");

#[program]
pub mod apmsdapp {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize(ctx)
    }

    pub fn create_conference(ctx: Context<CreateConference>, name: String, description: String, date: String, venue: String, submission_deadline: String, created_by: String, organiser_email: String, conference_link:String) -> Result<()> {
        instructions::create_conference(ctx, name, description, date, venue, submission_deadline, created_by, organiser_email, conference_link)
    }

    pub fn update_conference(ctx: Context<UpdateConference>, conference: Conference) -> Result<()> {
        instructions::update_conference(ctx, conference)
    }

    pub fn delete_conference(ctx: Context<DeleteConference>, id: Pubkey) -> Result<()> {
        instructions::delete_conference(ctx, id)
    }

    pub fn update_tpc(ctx: Context<UpdateTpc>, conferenceid:Pubkey, tpc:Vec<Tpc>) -> Result<()> {
        instructions::update_tpc(ctx, conferenceid, tpc)
    }

    pub fn submit_paper(ctx: Context<SubmitPaper>, conferenceid:Pubkey, paper_id: String, paper_hash: String, paper_name: String, paper_title: String, paper_abstract: String, paper_authors: Vec<Author>, date_submitted: String, version:u8, prev_version:String) -> Result<()> {
        instructions::submit_paper(ctx, conferenceid, paper_id, paper_hash, paper_name, paper_title, paper_abstract, paper_authors, date_submitted, version, prev_version)
    }

    pub fn delete_paper(ctx: Context<DeletePaper>, conferenceid:Pubkey, paper_id: String) -> Result<()> {
        instructions::delete_paper(ctx, conferenceid, paper_id)
    }
}