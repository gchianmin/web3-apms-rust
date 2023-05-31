use account_data::*;
use anchor_lang::prelude::*;
use instructions::*;

mod account_data;
mod errors;
mod instructions;

declare_id!("GuXZpX5WsfxdBMeeCdzuVpfMjzNKJn1ZvdoZwb5A3d8T");

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

    pub fn delete_paper(ctx: Context<DeletePaper>, conferenceid:Pubkey, paper_hash: String) -> Result<()> {
        instructions::delete_paper(ctx, conferenceid, paper_hash)
    }

    pub fn assign_reviewer(ctx: Context<AssignReviewer>, conferenceid: Pubkey, paper_hash: String, reviewer: Vec<Reviewers>, chair: Reviewers) -> Result<()> {
        instructions::assign_reviewer(ctx, conferenceid, paper_hash, reviewer, chair)
    }

    pub fn review_paper(ctx: Context<ReviewPaper>, conferenceid: Pubkey, paper_hash: String, reviewer_email: String, chair: bool, approval: u8, feedback: String, feedback_submitted_datetime: String) -> Result<()> {
        instructions::review_paper(ctx, conferenceid, paper_hash, reviewer_email, chair, approval, feedback, feedback_submitted_datetime)
    }

    pub fn revise_paper(ctx: Context<RevisePaper>, conferenceid: Pubkey, prev_paper_hash: String, paper_id: String, paper_hash: String, paper_name:String, paper_title: String, paper_abstract: String, date_submitted: String, response_letter_hash: String, response_letter_name: String) -> Result<()> {
        instructions::revise_paper(ctx, conferenceid, prev_paper_hash, paper_id, paper_hash, paper_name, paper_title, paper_abstract, date_submitted, response_letter_hash, response_letter_name)
    }

    pub fn make_payment(ctx: Context<MakePayment>, conferenceid: Pubkey, paper_hash: String, amount: u64, payment_date:String, presenter: Registration,) -> Result<()> {
        instructions::make_payment(ctx, conferenceid, paper_hash, amount, payment_date, presenter)
    }

    pub fn payout_reviewer(ctx: Context<TransferSolWithCpi>, conferenceid: Pubkey, recepient_wallet: Pubkey, amount: u64) -> Result<()> {
        instructions::payout_reviewer(ctx, conferenceid, recepient_wallet, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, conferenceid: Pubkey, amount: u64) -> Result<()> {
        instructions::withdraw(ctx, conferenceid, amount)
    }

    pub fn register_conference(ctx: Context<RegisterConference>, conferenceid:Pubkey, paper_hash: String, presenter: Registration, payment_transaction: String) -> Result<()> {
        instructions::register_conference(ctx, conferenceid, paper_hash, presenter, payment_transaction)
    }

}