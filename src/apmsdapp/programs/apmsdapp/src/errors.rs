use anchor_lang::prelude::*;

#[error_code]
pub enum ConferenceError {
  #[msg("The conference with the given id is not found")]
  ConferenceNotFound,
}
