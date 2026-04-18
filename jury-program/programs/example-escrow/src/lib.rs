use anchor_lang::prelude::*;
use jury_program::cpi::accounts::CreateDispute;
use jury_program::cpi::create_dispute;
use jury_program::program::JuryProgram;

declare_id!("GRsgA2biJW7qLX5YyHXxX46g2GhcqtpR5UuChuH41s7J");

/// Example: an escrow service that embeds JURY dispute resolution via CPI.
///
/// When a buyer contests a trade, the escrow program creates a dispute
/// on-chain by calling `jury_program::cpi::create_dispute`. This proves
/// that any Anchor program can embed verifiable jury selection with a
/// single cross-program invocation — no SDK, no off-chain coordination.
#[program]
pub mod example_escrow {
    use super::*;

    /// Buyer contests a trade. The escrow program CPI-calls JURY to create
    /// an on-chain dispute with VRF-backed jury selection.
    pub fn contest_trade(
        ctx: Context<ContestTrade>,
        dispute_id: [u8; 32],
        reason: String,
        stake_lamports: u64,
    ) -> Result<()> {
        // One CPI call embeds the full dispute lifecycle
        let cpi_program = ctx.accounts.jury_program.to_account_info();
        let cpi_accounts = CreateDispute {
            plaintiff: ctx.accounts.buyer.to_account_info(),
            dispute: ctx.accounts.dispute.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        };
        create_dispute(
            CpiContext::new(cpi_program, cpi_accounts),
            dispute_id,
            reason,
            stake_lamports,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(dispute_id: [u8; 32])]
pub struct ContestTrade<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: Dispute PDA — validated by jury_program via CPI seeds check
    #[account(mut)]
    pub dispute: AccountInfo<'info>,
    pub jury_program: Program<'info, JuryProgram>,
    pub system_program: Program<'info, System>,
}
