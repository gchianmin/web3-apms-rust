use crate::account_data::*;
use anchor_lang::prelude::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct RevisePaper<'info> {
  #[account(mut)]
  pub conference_list: Account<'info, ConferenceListAccountData>,
  #[account(mut)]
  pub user: Signer<'info>,
}

pub fn revise_paper(ctx: Context<RevisePaper>, conferenceid:Pubkey, prev_paper_hash: String, paper_id: String, paper_hash: String, paper_name:String, paper_title: String, paper_abstract: String, date_submitted: String, response_letter_hash: String, response_letter_name: String) -> Result<()> {
    let account = &mut ctx.accounts.conference_list;
    let paper_admin = *ctx.accounts.user.key;
    let prev_hash = &prev_paper_hash.to_string();
    let prev_version = (*prev_hash).to_owned().to_string();
    let index = account.get_conference_index(conferenceid)?;
    let paper_index = account.get_paper_index(index, (*prev_hash).to_owned())?;
    let paper = &mut account.conferences.get_mut(index).ok_or(ConferenceError::ConferenceNotFound)?.paper_submitted.get_mut(paper_index).expect("");   

    // //update prev paper status to under revision
    paper.paper_status = 5;
    
    let mut reviewer = paper.reviewer.clone();
    let mut paper_chair = paper.paper_chair.clone();
    let version = paper.version + 1;
    let paper_authors = paper.paper_authors.clone();
    let conf =  &mut (account.conferences.get_mut(index).expect(""));
    
    for rev in reviewer.iter_mut() {
        // rev.tpc_wallet = ;
        rev.approval = 0;
        rev.feedback = String::new();
        rev.feedback_submitted_datetime = String::new();
     }

    // paper_chair.tpc_wallet = String::new();
    paper_chair.approval = 0;
    paper_chair.feedback = String::new();
    paper_chair.feedback_submitted_datetime = String::new();
    
    conf.paper_submitted.push(Paper {
        paper_id,
        paper_hash,
        paper_admin,
        paper_name,
        paper_title,
        paper_abstract,
        paper_authors,
        date_submitted,
        paper_status: 1,
        version,
        prev_version,
        response_letter_hash,
        response_letter_name,
        fee_paid: 0,
        fee_paid_datetime: String::new(),
        fee_paid_transaction: String::new(),
        reviewer,
        paper_chair,
        registration_details: Registration::default(),
    });

    Ok(())
}