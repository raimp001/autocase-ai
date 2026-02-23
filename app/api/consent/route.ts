// app/api/consent/route.ts
// TASK-4: Patient e-consent portal with Solana on-chain attestation
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { attestConsentOnChain } from '@/lib/solana/royalty-distributor';
import { Keypair } from '@solana/web3.js';
import crypto from 'crypto';

// POST /api/consent - Record patient consent and attest hash on Solana
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { personId, walletAddress, optInRwe, tier, consentText, policyVersion } = body;

    // Validate required fields
    if (!personId || typeof optInRwe !== 'boolean') {
      return NextResponse.json({ error: 'personId and optInRwe required' }, { status: 400 });
    }

    // Validate Solana wallet format if provided
    if (walletAddress && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      return NextResponse.json({ error: 'Invalid Solana wallet address' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const policyVer = policyVersion ?? '1.0';
    const consentTier = tier ?? (optInRwe ? 2 : 1);

    // Create SHA-256 hash of consent payload for cryptographic proof
    // Hash includes: personId, optIn, policy version, tier, timestamp
    // Does NOT include wallet address (not needed for integrity proof)
    const payloadToHash = JSON.stringify({
      personId,
      optInRwe,
      tier: consentTier,
      policyVersion: policyVer,
      consentText: consentText ?? 'AutoCaseAI Standard Oncology Data Consent v1.0',
      timestamp,
    });
    const consentHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

    // Attest consent hash on Solana blockchain
    let txHash: string | null = null;
    try {
      const treasurySecret = process.env.SOLANA_TREASURY_SECRET;
      if (treasurySecret) {
        const payerKeypair = Keypair.fromSecretKey(
          Buffer.from(JSON.parse(treasurySecret))
        );
        txHash = await attestConsentOnChain(payerKeypair, consentHash, parseInt(personId));
      }
    } catch (solanaError) {
      // Non-fatal: log but don't block consent recording
      console.error('Solana attestation failed (non-fatal):', solanaError);
    }

    // Upsert Consent record in OMOP-compliant DB
    const consent = await prisma.consent.upsert({
      where: { person_id: parseInt(personId) },
      update: {
        status: 'GRANTED',
        solana_wallet: walletAddress ?? null,
        rwe_opt_in: optInRwe,
        tier: consentTier,
        policy_version: policyVer,
        signed_at: new Date(),
        tx_hash: txHash,
        revoked_at: null,
      },
      create: {
        person_id: parseInt(personId),
        status: 'GRANTED',
        solana_wallet: walletAddress ?? null,
        rwe_opt_in: optInRwe,
        tier: consentTier,
        policy_version: policyVer,
        tx_hash: txHash,
      },
    });

    // Update any pending case reports for this patient
    await prisma.caseReport.updateMany({
      where: {
        person_id: parseInt(personId),
        status: 'CONSENT_PENDING',
      },
      data: { status: 'FLAGGED' }, // Move to physician review queue
    });

    return NextResponse.json({
      success: true,
      consentId: consent.consent_id,
      onChainAttestation: txHash,
      consentHash,
      tier: consentTier,
      message: txHash
        ? 'Consent recorded and attested on Solana blockchain.'
        : 'Consent recorded. On-chain attestation unavailable.',
    });
  } catch (error) {
    console.error('Consent Error:', error);
    return NextResponse.json({ error: 'Failed to process consent' }, { status: 500 });
  }
}

// GET /api/consent?personId=X - Retrieve consent status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const personId = searchParams.get('personId');

  if (!personId) {
    return NextResponse.json({ error: 'personId required' }, { status: 400 });
  }

  const consent = await prisma.consent.findUnique({
    where: { person_id: parseInt(personId) },
    select: {
      consent_id: true,
      status: true,
      rwe_opt_in: true,
      tier: true,
      policy_version: true,
      signed_at: true,
      tx_hash: true,
      // Never expose solana_wallet in API response
    },
  });

  if (!consent) {
    return NextResponse.json({ status: 'PENDING', message: 'No consent record found' });
  }

  return NextResponse.json(consent);
}

// DELETE /api/consent - Revoke consent
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const personId = searchParams.get('personId');

  if (!personId) {
    return NextResponse.json({ error: 'personId required' }, { status: 400 });
  }

  const consent = await prisma.consent.update({
    where: { person_id: parseInt(personId) },
    data: { status: 'REVOKED', revoked_at: new Date() },
  });

  return NextResponse.json({ success: true, consentId: consent.consent_id, status: 'REVOKED' });
}
