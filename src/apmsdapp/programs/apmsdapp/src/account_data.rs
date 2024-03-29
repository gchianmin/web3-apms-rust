use crate::errors::*;
use anchor_lang::prelude::*;

#[account]
pub struct RecepientListData {
  pub count: u8,                
  pub recepient: Vec<Pubkey>,      
}


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

  pub fn get_paper_index(&self, conference_index: usize, hash: String) -> Result<usize> {
    for (index, paper) in self.conferences[conference_index].paper_submitted.iter().enumerate() {
      if paper.paper_hash == hash {
        return Ok(index);
      }
    }
    err!(ConferenceError::PaperNotFound)
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
  pub paper_hash: String,
  pub paper_admin: Pubkey,
  pub paper_name: String,
  pub paper_title: String, 
  pub paper_abstract: String,
  pub paper_authors: Vec<Author>,
  pub date_submitted: String,
  pub paper_status: u8,
  pub version: u8,
  pub prev_version: String,
  pub response_letter_hash: String,
  pub response_letter_name: String,
  pub fee_paid: u64,
  pub fee_paid_datetime: String,
  pub fee_paid_transaction: String,
  pub reviewer: Vec<Reviewers>, 
  pub paper_chair: Reviewers,
  pub registration_details: Registration,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Default)]
pub struct Registration {
  pub presenter_name: String,
  pub presenter_email: String,
  pub presenter_affiliation: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Author {
  pub author_name: String,
  pub author_email: String,
  pub author_affiliation: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Tpc {
  pub tpc_name: String,
  pub tpc_email: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Default)]
pub struct Reviewers {
  pub tpc_name: String,
  pub tpc_email: String,
  pub tpc_wallet: Pubkey,
  pub approval: u8,
  pub feedback: String,
  pub feedback_submitted_datetime: String,
  pub paidout: u8,
  pub review_deadline: String,
}

impl Default for Tpc {
  fn default () -> Tpc {
      Tpc{tpc_name: String::new(), tpc_email: String::new() }
  }
}

impl Default for Author {
  fn default () -> Author {
    Author{author_name: String::new(), author_email: String::new(), author_affiliation: String::new()}
  }
}

// impl Default for Reviewers {
//   fn default () -> Reviewers {
//     Reviewers{tpc_name: String::new(), tpc_email: String::new(), tpc_wallet: , approval: 0, feedback: String::new()}
//   }
// }