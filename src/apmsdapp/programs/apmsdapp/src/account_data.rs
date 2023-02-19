use crate::errors::*;
use anchor_lang::prelude::*;

#[account]
pub struct ConferenceListAccountData {
  pub count: u8,                
  pub deleted_indexes: Vec<u8>, 
  pub conferences: Vec<Conference>,      
}

impl ConferenceListAccountData {

  pub fn get_conference_index(&self, id: Pubkey) -> Result<usize> {
    for (index, conference) in self.conferences.iter().enumerate() {
      if conference.id == id {
        return Ok(index);
      }
    }

    err!(ConferenceError::ConferenceNotFound)
  }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Conference {
  pub id: Pubkey,     
  pub admin: Pubkey, 
  pub name: String,
  pub description: String,
  pub date: String,
  pub venue: String,
  pub submission_deadline: String,
  pub paper_submitted: Vec<Paper>,
  pub fee_received: u64,
  pub created_by: String,
  pub organiser_email: String,
  pub technical_programs_committees: Vec<Tpc>,
  pub conference_link: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Paper {
  pub paper_id: String,
  pub paper_admin: Pubkey,
  pub paper_name: String,
  pub paper_authors: Vec<Author>,
  pub date_submitted: String,
  pub paper_status: u8,
  pub version: u8,
  pub prev_version: String,
  pub fee_paid: u64,
  pub reviewer: Vec<Reviwers>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Author {
  pub author_name: String,
  pub author_email: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Tpc {
  pub tpc_name: String,
  pub tpc_email: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Reviwers {
  pub tpc_name: String,
  pub tpc_email: String,
  pub tpc_wallet: String,
  pub approval: u8,
  pub feedback: String,
}

impl Default for Tpc {
  fn default () -> Tpc {
      Tpc{tpc_name: String::new(), tpc_email: String::new() }
  }
}

impl Default for Author {
  fn default () -> Author {
    Author{author_name: String::new(), author_email: String::new() }
  }
}