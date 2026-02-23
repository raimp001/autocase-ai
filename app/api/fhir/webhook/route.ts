// app/api/fhir/webhook/route.ts
// TASK-3: SMART on FHIR R4 webhook listener for rare oncology case detection
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processEmrToOmop } from '@/lib/llm/omop-extractor';
import crypto from 'crypto';

// Rare oncology ICD-10 codes for flag triggering
// Covers mesothelioma, peritoneal meso, appendiceal, adrenocortical, MCC, uveal melanoma
const RARE_ONCOLOGY_CODES = [
  'C38.4', // Pleural mesothelioma
  'C45.9', // Mesothelioma unspecified
  'C48.2', // Peritoneal mesothelioma
  'C74.0', // Adrenocortical carcinoma
  'C44.20', // Merkel cell carcinoma
  'C69.3', // Uveal melanoma
  'C18.1', // Appendiceal carcinoma
  'C80.1', // Malignant neoplasm, unspecified + atypical presentation
];

// Rare SNOMED-CT concept IDs for condition matching
const RARE_SNOMED_CONCEPTS = [
  302849000,  // Mesothelioma
  109989006,  // Adrenocortical carcinoma
  404074006,  // Merkel cell carcinoma
  399488007,  // Uveal melanoma
];

interface FhirEntry {
  resource: {
    resourceType: string;
    id?: string;
    code?: { coding?: { system: string; code: string; display?: string }[] };
    text?: { div: string };
    content?: { attachment: { data: string } }[];
  };
}

interface FhirBundle {
  resourceType: string;
  entry?: FhirEntry[];
  text?: { div: string };
}

function hashMrn(mrn: string): string {
  return crypto.createHash('sha256').update(mrn + (process.env.MRN_SALT ?? 'autocase-salt')).digest('hex').slice(0, 32);
}

function detectRareCase(conditions: FhirEntry[]): { isRare: boolean; reason: string } {
  const matchedCodes: string[] = [];

  for (const entry of conditions) {
    const codings = entry.resource.code?.coding ?? [];
    for (const coding of codings) {
      if (RARE_ONCOLOGY_CODES.includes(coding.code)) {
        matchedCodes.push(`ICD-10:${coding.code} (${coding.display ?? 'unknown'})`);
      }
      const snomedCode = parseInt(coding.code);
      if (RARE_SNOMED_CONCEPTS.includes(snomedCode)) {
        matchedCodes.push(`SNOMED:${coding.code} (${coding.display ?? 'unknown'})`);
      }
    }
  }

  if (matchedCodes.length > 0) {
    return {
      isRare: true,
      reason: `Rare oncology codes detected: ${matchedCodes.join(', ')}`,
    };
  }

  return { isRare: false, reason: '' };
}

export async function POST(request: Request) {
  try {
    // Validate webhook signature (basic HMAC for Epic/Cerner integrations)
    const webhookSecret = process.env.FHIR_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-hub-signature-256');
      const body = await request.text();
      const expected = 'sha256=' + crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
      if (signature !== expected) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const fhirBundle: FhirBundle = await request.json();

    if (fhirBundle.resourceType !== 'Bundle') {
      return NextResponse.json({ error: 'Expected FHIR Bundle' }, { status: 400 });
    }

    const entries = fhirBundle.entry ?? [];

    // Extract key resources
    const patientResource = entries.find(e => e.resource.resourceType === 'Patient');
    const conditions = entries.filter(e => e.resource.resourceType === 'Condition');
    const documents = entries.filter(
      e => e.resource.resourceType === 'DocumentReference' || e.resource.resourceType === 'DiagnosticReport'
    );

    if (!patientResource) {
      return NextResponse.json({ error: 'No Patient resource in Bundle' }, { status: 400 });
    }

    // Hash MRN for de-identification
    const rawMrn = patientResource.resource.id ?? 'unknown';
    const hashedMrn = hashMrn(rawMrn);

    // Extract or construct clinical narrative from documents
    const narrativeText = documents
      .map(d => d.resource.text?.div?.replace(/<[^>]*>/g, ' ').trim() ?? '')
      .filter(Boolean)
      .join('\n\n') || fhirBundle.text?.div?.replace(/<[^>]*>/g, ' ').trim() || 'No narrative available';

    // Detect rare oncology case
    const { isRare, reason } = detectRareCase(conditions);

    // Upsert Person (OMOP CDM)
    const person = await prisma.person.upsert({
      where: { person_source_value: hashedMrn },
      update: {},
      create: {
        gender_concept_id: 8521,     // Unknown/Other concept as default
        year_of_birth: 1970,          // Will be updated by clinical abstractor
        race_concept_id: 0,
        ethnicity_concept_id: 0,
        person_source_value: hashedMrn,
      },
    });

    // Create CaseReport with FLAGGED status
    const caseReport = await prisma.caseReport.create({
      data: {
        person_id: person.person_id,
        provider_id: 1, // Default attending; will be linked by physician in dashboard
        emr_narrative: narrativeText.slice(0, 10000), // Cap at 10K chars
        is_rare_flag: isRare,
        rare_flag_reason: reason || null,
        status: isRare ? 'CONSENT_PENDING' : 'FLAGGED',
      },
    });

    // If rare, auto-trigger OMOP extraction (async, non-blocking)
    if (isRare) {
      processEmrToOmop(caseReport.case_id).catch(err =>
        console.error(`OMOP extraction failed for case ${caseReport.case_id}:`, err)
      );
    }

    return NextResponse.json({
      success: true,
      caseId: caseReport.case_id,
      personId: person.person_id,
      isRare,
      flagReason: reason,
      status: caseReport.status,
    });
  } catch (error) {
    console.error('FHIR Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
