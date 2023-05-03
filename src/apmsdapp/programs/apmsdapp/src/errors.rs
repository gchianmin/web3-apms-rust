use anchor_lang::prelude::*;

#[error_code]
pub enum ConferenceError {
  #[msg("The conference with the given id is not found")]
  ConferenceNotFound,
  #[msg("You are not authorized to perform this action")]
  NotAuthorized,
  #[msg("The paper with the given id is not found")]
  PaperNotFound,
  #[msg("All the reviewers must finish reviewing before the chair can make the final review")]
  NotReviewedByAll,
  #[msg("Error in token transaction")]
  TokenTransactionError,
}
