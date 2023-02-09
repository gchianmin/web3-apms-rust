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
  pub technical_programs_committees: Tpc,
  pub conference_link: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Paper {
  pub paper_id: String,
  pub paper_admin: Pubkey,
  pub paper_authors: Author,
  pub date_submitted: String,
  pub paper_status: String,
  pub version: u8,
  pub fee_paid: u64,
  pub reviewer: Tpc,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Author {
  pub author_name: Vec<String>,
  pub author_email: Vec<String>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Tpc {
  pub tpc_name: Vec<String>,
  pub tpc_email: Vec<String>,
  pub tpc_wallet: Vec<String>,
}

impl Default for Tpc {
  fn default () -> Tpc {
      Tpc{tpc_name: Vec::new(), tpc_email: Vec::new(), tpc_wallet: Vec::new() }
  }
}

impl Default for Author {
  fn default () -> Author {
    Author{author_name: Vec::new(), author_email: Vec::new() }
  }
}