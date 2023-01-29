use crate::errors::*;
use anchor_lang::prelude::*;

#[account]
pub struct ConferenceListAccountData {
  pub count: u8,                
  pub deleted_indexes: Vec<u8>, 
  pub conferences: Vec<Conference>,      
}

impl ConferenceListAccountData {
  // const COUNT_SIZE: usize = 1;
  // const DELETED_INDEXES: usize = 4 + MAX_TODO_LIST_LENGTH * 1;
  // const TODOS_SIZE: usize = 4 + MAX_TODO_LIST_LENGTH * (32 + 4 + 200 + 1);
  // pub const MAX_SIZE: usize = TodoListAccountData::COUNT_SIZE
  //   + TodoListAccountData::DELETED_INDEXES
  //   + TodoListAccountData::TODOS_SIZE;

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
  pub paper_submitted: u64,
  pub fee_received: u64,
  pub created_by: String,
  pub organiser_email: String,
}
