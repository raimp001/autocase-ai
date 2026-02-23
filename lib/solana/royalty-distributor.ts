// lib/solana/royalty-distributor.ts
// TASK-8: Solana USDC micro-royalty distribution engine
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';

// Devnet USDC mint — replace with mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
const USDC_MINT = new PublicKey(
  process.env.SOLANA_USDC_MINT ?? '4zMMC9srt5Ri5X14YGWAyUcM9pA9qDqN1XqWdGEHn6D8'
);
const MEMO_PROGRAM_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLkFkwBf'
);

export interface RoyaltySplit {
  platformWallet: string;
  physicianWallet: string;
  patientWallets: string[];
  totalUsdcAmount: number; // USD value (e.g. 1000 = $1000)
  queryRef: string;        // RweQuery ID for audit trail
}

export interface DistributionResult {
  txHash: string;
  platformCut: number;
  physicianCut: number;
  perPatientCut: number;
  patientCount: number;
}

/**
 * Distributes USDC royalties from the platform treasury to physician and patients.
 * Split: 20% Platform | 30% Physician | 50% Patients (equal per-capita)
 */
export async function distributeRweRoyalties(
  payerKeypair: Keypair,
  split: RoyaltySplit
): Promise<DistributionResult> {
  const connection = new Connection(
    process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com',
    'confirmed'
  );

  const USDC_DECIMALS = 6;
  const multiplier = Math.pow(10, USDC_DECIMALS);
  const totalLamports = Math.floor(split.totalUsdcAmount * multiplier);

  // Calculate splits
  const platformCutLamports = Math.floor(totalLamports * 0.20);
  const physicianCutLamports = Math.floor(totalLamports * 0.30);
  const patientPoolLamports = totalLamports - platformCutLamports - physicianCutLamports;
  const perPatientCutLamports =
    split.patientWallets.length > 0
      ? Math.floor(patientPoolLamports / split.patientWallets.length)
      : 0;

  // Get sender ATA
  const senderAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payerKeypair,
    USDC_MINT,
    payerKeypair.publicKey
  );

  const tx = new Transaction();

  // Memo instruction for on-chain audit trail
  tx.add(
    new TransactionInstruction({
      keys: [{ pubkey: payerKeypair.publicKey, isSigner: true, isWritable: false }],
      data: Buffer.from(
        `AutoCaseAI RWE Royalty | QueryRef:${split.queryRef} | Patients:${split.patientWallets.length}`,
        'utf-8'
      ),
      programId: MEMO_PROGRAM_ID,
    })
  );

  // Helper: append a USDC transfer instruction
  const addTransfer = async (destinationAddress: string, amountLamports: number) => {
    if (amountLamports <= 0) return;
    const destPubkey = new PublicKey(destinationAddress);
    const destAta = await getOrCreateAssociatedTokenAccount(
      connection,
      payerKeypair,
      USDC_MINT,
      destPubkey
    );
    tx.add(
      createTransferInstruction(
        senderAta.address,
        destAta.address,
        payerKeypair.publicKey,
        amountLamports
      )
    );
  };

  // Platform cut (stays in treasury — self-transfer for accounting)
  await addTransfer(split.platformWallet, platformCutLamports);
  // Physician cut
  await addTransfer(split.physicianWallet, physicianCutLamports);
  // Patient cuts (batched in a single tx)
  for (const patientWallet of split.patientWallets) {
    await addTransfer(patientWallet, perPatientCutLamports);
  }

  const txHash = await sendAndConfirmTransaction(connection, tx, [payerKeypair]);

  return {
    txHash,
    platformCut: platformCutLamports / multiplier,
    physicianCut: physicianCutLamports / multiplier,
    perPatientCut: perPatientCutLamports / multiplier,
    patientCount: split.patientWallets.length,
  };
}

/**
 * Logs a consent attestation hash to the Solana blockchain via the Memo program.
 * Stores SHA-256 of consent payload — no PHI on-chain.
 */
export async function attestConsentOnChain(
  payerKeypair: Keypair,
  consentHash: string,
  personId: number
): Promise<string> {
  const connection = new Connection(
    process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com',
    'confirmed'
  );

  const tx = new Transaction().add(
    new TransactionInstruction({
      keys: [{ pubkey: payerKeypair.publicKey, isSigner: true, isWritable: false }],
      data: Buffer.from(
        `AutoCaseAI Consent | PersonID:${personId} | SHA256:${consentHash}`,
        'utf-8'
      ),
      programId: MEMO_PROGRAM_ID,
    })
  );

  return sendAndConfirmTransaction(connection, tx, [payerKeypair]);
}
