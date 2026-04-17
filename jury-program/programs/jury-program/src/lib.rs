use anchor_lang::prelude::*;
use orao_solana_vrf::program::OraoVrf;
use orao_solana_vrf::state::NetworkState;
use orao_solana_vrf::CONFIG_ACCOUNT_SEED;
use orao_solana_vrf::RANDOMNESS_ACCOUNT_SEED;

declare_id!("4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15");

pub const DISPUTE_SEED: &[u8] = b"dispute";
pub const JURY_POOL_SIZE: u8 = 9;
pub const JURY_SIZE: u8 = 3;

#[program]
pub mod jury_program {
    use orao_solana_vrf::cpi::accounts::RequestV2;
    use super::*;

    /// Create a new dispute between two parties.
    /// Both parties stake SOL; the loser forfeits their stake.
    pub fn create_dispute(
        ctx: Context<CreateDispute>,
        dispute_id: [u8; 32],
        description: String,
        stake_lamports: u64,
    ) -> Result<()> {
        require!(description.len() <= 256, JuryError::DescriptionTooLong);
        require!(stake_lamports > 0, JuryError::ZeroStake);

        let dispute = &mut ctx.accounts.dispute;
        dispute.id = dispute_id;
        dispute.plaintiff = ctx.accounts.plaintiff.key();
        dispute.defendant = Pubkey::default();
        dispute.description = description;
        dispute.stake_lamports = stake_lamports;
        dispute.status = DisputeStatus::Open;
        dispute.jury = [Pubkey::default(); 3];
        dispute.votes = [0u8; 3];
        dispute.vrf_seed = [0u8; 32];
        dispute.created_at = Clock::get()?.unix_timestamp;
        dispute.bump = ctx.bumps.dispute;
        dispute.winner = 0;

        // Transfer plaintiff's stake to dispute PDA
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.plaintiff.to_account_info(),
                    to: dispute.to_account_info(),
                },
            ),
            stake_lamports,
        )?;

        emit!(DisputeCreated {
            dispute_id,
            plaintiff: ctx.accounts.plaintiff.key(),
            stake_lamports,
        });

        Ok(())
    }

    /// Defendant joins the dispute and stakes matching SOL.
    pub fn join_dispute(ctx: Context<JoinDispute>) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::Open, JuryError::InvalidStatus);
        require!(dispute.defendant == Pubkey::default(), JuryError::DefendantAlreadyJoined);

        dispute.defendant = ctx.accounts.defendant.key();

        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.defendant.to_account_info(),
                    to: dispute.to_account_info(),
                },
            ),
            dispute.stake_lamports,
        )?;

        dispute.status = DisputeStatus::AwaitingJury;

        emit!(DefendantJoined {
            dispute_id: dispute.id,
            defendant: ctx.accounts.defendant.key(),
        });

        Ok(())
    }

    /// Request VRF randomness for jury selection.
    pub fn request_jury(
        ctx: Context<RequestJury>,
        vrf_seed: [u8; 32],
    ) -> Result<()> {
        require!(vrf_seed != [0u8; 32], JuryError::ZeroSeed);

        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::AwaitingJury, JuryError::InvalidStatus);

        let cpi_program = ctx.accounts.vrf.to_account_info();
        let cpi_accounts = RequestV2 {
            payer: ctx.accounts.payer.to_account_info(),
            network_state: ctx.accounts.network_state.to_account_info(),
            treasury: ctx.accounts.treasury.to_account_info(),
            request: ctx.accounts.random.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        orao_solana_vrf::cpi::request_v2(cpi_ctx, vrf_seed)?;

        dispute.vrf_seed = vrf_seed;
        dispute.status = DisputeStatus::JuryRequested;

        emit!(JuryRequested {
            dispute_id: dispute.id,
            vrf_seed,
        });

        Ok(())
    }

    /// Reveal the jury after VRF fulfillment.
    pub fn reveal_jury(
        ctx: Context<RevealJury>,
        juror_pool: [Pubkey; 9],
    ) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::JuryRequested, JuryError::InvalidStatus);

        let random_data = &ctx.accounts.random;
        let randomness = get_fulfilled_randomness(random_data)?;

        let mut selected = [0u8; 3];
        let mut count = 0usize;
        let mut i = 0usize;
        while count < 3 && i < 64 {
            let idx = randomness[i] % JURY_POOL_SIZE;
            let mut is_dup = false;
            for j in 0..count {
                if selected[j] == idx {
                    is_dup = true;
                    break;
                }
            }
            if !is_dup {
                selected[count] = idx;
                count += 1;
            }
            i += 1;
        }
        require!(count == 3, JuryError::InsufficientRandomness);

        dispute.jury = [
            juror_pool[selected[0] as usize],
            juror_pool[selected[1] as usize],
            juror_pool[selected[2] as usize],
        ];
        dispute.status = DisputeStatus::Deliberating;

        emit!(JuryRevealed {
            dispute_id: dispute.id,
            jury: dispute.jury,
        });

        Ok(())
    }

    /// A selected juror casts their vote. 1=plaintiff, 2=defendant.
    pub fn cast_vote(ctx: Context<CastVote>, vote: u8) -> Result<()> {
        require!(vote == 1 || vote == 2, JuryError::InvalidVote);

        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::Deliberating, JuryError::InvalidStatus);

        let juror_key = ctx.accounts.juror.key();
        let mut juror_idx: Option<usize> = None;
        for i in 0..3 {
            if dispute.jury[i] == juror_key {
                juror_idx = Some(i);
                break;
            }
        }
        let idx = juror_idx.ok_or(JuryError::NotAJuror)?;
        require!(dispute.votes[idx] == 0, JuryError::AlreadyVoted);

        dispute.votes[idx] = vote;

        emit!(VoteCast {
            dispute_id: dispute.id,
            juror: juror_key,
            vote,
        });

        let total_votes: u8 = dispute.votes.iter().filter(|&&v| v > 0).count() as u8;
        if total_votes == JURY_SIZE {
            let plaintiff_votes = dispute.votes.iter().filter(|&&v| v == 1).count();
            let defendant_votes = dispute.votes.iter().filter(|&&v| v == 2).count();

            if plaintiff_votes > defendant_votes {
                dispute.winner = 1;
            } else {
                dispute.winner = 2;
            }
            dispute.status = DisputeStatus::Decided;

            emit!(VerdictReached {
                dispute_id: dispute.id,
                winner: dispute.winner,
                plaintiff_votes: plaintiff_votes as u8,
                defendant_votes: defendant_votes as u8,
            });
        }

        Ok(())
    }

    /// Winner claims the combined stakes.
    pub fn claim_stakes(ctx: Context<ClaimStakes>) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::Decided, JuryError::InvalidStatus);

        let winner_key = if dispute.winner == 1 {
            dispute.plaintiff
        } else {
            dispute.defendant
        };
        require!(ctx.accounts.winner.key() == winner_key, JuryError::NotTheWinner);

        let total_stakes = dispute.stake_lamports * 2;

        **dispute.to_account_info().try_borrow_mut_lamports()? -= total_stakes;
        **ctx.accounts.winner.to_account_info().try_borrow_mut_lamports()? += total_stakes;

        dispute.status = DisputeStatus::Claimed;

        emit!(StakesClaimed {
            dispute_id: dispute.id,
            winner: ctx.accounts.winner.key(),
            amount: total_stakes,
        });

        Ok(())
    }
}

// ─── Accounts ────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(dispute_id: [u8; 32])]
pub struct CreateDispute<'info> {
    #[account(mut)]
    pub plaintiff: Signer<'info>,
    #[account(
        init,
        payer = plaintiff,
        space = 8 + Dispute::SIZE,
        seeds = [DISPUTE_SEED, plaintiff.key().as_ref(), dispute_id.as_ref()],
        bump,
    )]
    pub dispute: Account<'info, Dispute>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinDispute<'info> {
    #[account(mut)]
    pub defendant: Signer<'info>,
    #[account(
        mut,
        seeds = [DISPUTE_SEED, dispute.plaintiff.as_ref(), dispute.id.as_ref()],
        bump = dispute.bump,
    )]
    pub dispute: Account<'info, Dispute>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(vrf_seed: [u8; 32])]
pub struct RequestJury<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [DISPUTE_SEED, dispute.plaintiff.as_ref(), dispute.id.as_ref()],
        bump = dispute.bump,
    )]
    pub dispute: Account<'info, Dispute>,
    /// CHECK: Orao VRF randomness account
    #[account(
        mut,
        seeds = [RANDOMNESS_ACCOUNT_SEED, &vrf_seed],
        bump,
        seeds::program = orao_solana_vrf::ID,
    )]
    pub random: AccountInfo<'info>,
    /// CHECK: Orao VRF treasury
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [CONFIG_ACCOUNT_SEED],
        bump,
        seeds::program = orao_solana_vrf::ID,
    )]
    pub network_state: Account<'info, NetworkState>,
    pub vrf: Program<'info, OraoVrf>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevealJury<'info> {
    #[account(
        mut,
        seeds = [DISPUTE_SEED, dispute.plaintiff.as_ref(), dispute.id.as_ref()],
        bump = dispute.bump,
    )]
    pub dispute: Account<'info, Dispute>,
    /// CHECK: Orao VRF randomness (fulfilled)
    #[account(
        seeds = [RANDOMNESS_ACCOUNT_SEED, dispute.vrf_seed.as_ref()],
        bump,
        seeds::program = orao_solana_vrf::ID,
    )]
    pub random: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    pub juror: Signer<'info>,
    #[account(
        mut,
        seeds = [DISPUTE_SEED, dispute.plaintiff.as_ref(), dispute.id.as_ref()],
        bump = dispute.bump,
    )]
    pub dispute: Account<'info, Dispute>,
}

#[derive(Accounts)]
pub struct ClaimStakes<'info> {
    #[account(mut)]
    pub winner: Signer<'info>,
    #[account(
        mut,
        seeds = [DISPUTE_SEED, dispute.plaintiff.as_ref(), dispute.id.as_ref()],
        bump = dispute.bump,
    )]
    pub dispute: Account<'info, Dispute>,
}

// ─── State ───────────────────────────────────────────────

#[account]
pub struct Dispute {
    pub id: [u8; 32],
    pub plaintiff: Pubkey,
    pub defendant: Pubkey,
    pub description: String,
    pub stake_lamports: u64,
    pub status: DisputeStatus,
    pub jury: [Pubkey; 3],
    pub votes: [u8; 3],
    pub vrf_seed: [u8; 32],
    pub winner: u8,
    pub created_at: i64,
    pub bump: u8,
}

impl Dispute {
    pub const SIZE: usize = 32 + 32 + 32 + (4 + 256) + 8 + 1 + (32 * 3) + 3 + 32 + 1 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum DisputeStatus {
    Open,
    AwaitingJury,
    JuryRequested,
    Deliberating,
    Decided,
    Claimed,
}

// ─── Errors ──────────────────────────────────────────────

#[error_code]
pub enum JuryError {
    #[msg("Description must be 256 characters or less")]
    DescriptionTooLong,
    #[msg("Stake must be greater than zero")]
    ZeroStake,
    #[msg("Invalid dispute status for this action")]
    InvalidStatus,
    #[msg("Defendant has already joined")]
    DefendantAlreadyJoined,
    #[msg("VRF seed must not be zero")]
    ZeroSeed,
    #[msg("Not enough randomness to select jury")]
    InsufficientRandomness,
    #[msg("Signer is not a selected juror")]
    NotAJuror,
    #[msg("Juror has already voted")]
    AlreadyVoted,
    #[msg("Invalid vote value")]
    InvalidVote,
    #[msg("Signer is not the dispute winner")]
    NotTheWinner,
    #[msg("VRF randomness not yet fulfilled")]
    RandomnessNotFulfilled,
}

// ─── Events ──────────────────────────────────────────────

#[event]
pub struct DisputeCreated {
    pub dispute_id: [u8; 32],
    pub plaintiff: Pubkey,
    pub stake_lamports: u64,
}

#[event]
pub struct DefendantJoined {
    pub dispute_id: [u8; 32],
    pub defendant: Pubkey,
}

#[event]
pub struct JuryRequested {
    pub dispute_id: [u8; 32],
    pub vrf_seed: [u8; 32],
}

#[event]
pub struct JuryRevealed {
    pub dispute_id: [u8; 32],
    pub jury: [Pubkey; 3],
}

#[event]
pub struct VoteCast {
    pub dispute_id: [u8; 32],
    pub juror: Pubkey,
    pub vote: u8,
}

#[event]
pub struct VerdictReached {
    pub dispute_id: [u8; 32],
    pub winner: u8,
    pub plaintiff_votes: u8,
    pub defendant_votes: u8,
}

#[event]
pub struct StakesClaimed {
    pub dispute_id: [u8; 32],
    pub winner: Pubkey,
    pub amount: u64,
}

// ─── Helpers ─────────────────────────────────────────────

fn get_fulfilled_randomness(account: &AccountInfo) -> Result<[u8; 64]> {
    if account.data_is_empty() {
        return Err(JuryError::RandomnessNotFulfilled.into());
    }
    use anchor_lang::AccountDeserialize;
    let data = orao_solana_vrf::state::RandomnessAccountData::try_deserialize(
        &mut &account.data.borrow()[..],
    )
    .map_err(|_| JuryError::RandomnessNotFulfilled)?;

    match data.fulfilled_randomness() {
        Some(randomness) => Ok(*randomness),
        None => Err(JuryError::RandomnessNotFulfilled.into()),
    }
}
