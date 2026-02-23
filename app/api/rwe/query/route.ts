// app/api/rwe/query/route.ts
// TASK-7: B2B pharma RWE query API with Stripe auth and Solana royalty distribution
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { distributeRweRoyalties } from '@/lib/solana/royalty-distributor';
import { Keypair } from '@solana/web3.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

// Available OMOP cohort queries for pharmaceutical clients
export async function POST(request: Request) {
  try {
    // 1. Authenticate B2B client via API key
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const apiKey = authHeader.replace('Bearer ', '');
    // In production: look up API key in DB and verify subscription
    if (apiKey !== process.env.RWE_API_KEY && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const body = await request.json();
    const {
      snomedConceptId,
      queryPaymentAmount = 1000,
      clientName = 'Unknown Pharma Client',
      stripePaymentIntentId,
    } = body;

    if (!snomedConceptId) {
      return NextResponse.json({ error: 'snomedConceptId required' }, { status: 400 });
    }

    // 2. Verify Stripe payment (for paid queries)
    if (stripePaymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json({ error: 'Payment not confirmed' }, { status: 402 });
      }
    }

    // 3. Query OMOP ConditionOccurrence cohort (de-identified)
    const cohortConditions = await prisma.conditionOccurrence.findMany({
      where: { condition_concept_id: parseInt(snomedConceptId) },
      include: {
        person: {
          include: {
            consent: true,
            drugs: {
              orderBy: { drug_exposure_start_date: 'asc' },
              take: 10,
            },
            measurements: {
              orderBy: { measurement_date: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    // 4. Filter only GRANTED RWE-consented patients
    const consentedCohort = cohortConditions.filter(
      c => c.person.consent?.status === 'GRANTED' && c.person.consent?.rwe_opt_in === true
    );

    const patientWallets = consentedCohort
      .map(c => c.person.consent?.solana_wallet)
      .filter((w): w is string => Boolean(w));

    // 5. Get attending physician wallet for this cohort
    // In production: look up the specific attending physician for each case
    const physicianWallet =
      process.env.PHYSICIAN_DEFAULT_WALLET ??
      'PhysicianDefaultWalletAddressPlaceholder11111111';

    // 6. Trigger Solana royalty distribution (non-blocking)
    let txHash: string | null = null;
    try {
      const treasurySecret = process.env.SOLANA_TREASURY_SECRET;
      if (treasurySecret && patientWallets.length > 0) {
        const platformKeypair = Keypair.fromSecretKey(
          Buffer.from(JSON.parse(treasurySecret))
        );
        const result = await distributeRweRoyalties(platformKeypair, {
          platformWallet: process.env.PLATFORM_SOLANA_WALLET!,
          physicianWallet,
          patientWallets,
          totalUsdcAmount: queryPaymentAmount,
          queryRef: `rwe-${snomedConceptId}-${Date.now()}`,
        });
        txHash = result.txHash;
      }
    } catch (solanaErr) {
      console.error('Royalty distribution failed (non-fatal):', solanaErr);
    }

    // 7. Log the query for audit trail
    const rweQuery = await prisma.rweQuery.create({
      data: {
        client_name: clientName,
        snomed_concept: parseInt(snomedConceptId),
        payment_amount: queryPaymentAmount,
        patient_count: consentedCohort.length,
        tx_hash: txHash,
        stripe_charge: stripePaymentIntentId ?? null,
      },
    });

    // 8. Build de-identified cohort response
    // Never expose: person_source_value, solana_wallet, or any linking keys
    const deidentifiedCohort = consentedCohort.map((c, idx) => ({
      cohortIndex: idx + 1,
      genderConceptId: c.person.gender_concept_id,
      yearOfBirth: c.person.year_of_birth,
      conditionStartDate: c.condition_start_date,
      conditionSourceValue: c.condition_source_value,
      lineOfTherapyCount: c.person.drugs.length,
      latestMeasurements: c.person.measurements.map(m => ({
        conceptId: m.measurement_concept_id,
        value: m.value_as_number,
        date: m.measurement_date,
      })),
    }));

    return NextResponse.json({
      success: true,
      queryId: rweQuery.query_id,
      snomedConceptId,
      cohortSize: consentedCohort.length,
      royaltyDistribution: {
        txHash,
        totalUsdcDistributed: queryPaymentAmount * 0.80, // 80% to physicians + patients
        patientsRewarded: patientWallets.length,
      },
      data: deidentifiedCohort,
    });
  } catch (error) {
    console.error('RWE Query Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
