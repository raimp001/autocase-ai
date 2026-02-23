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
  302849000, // Mesothelioma
  109989006, // Adrenocortical carcinoma
  404074006, // Merkel cell carcinoma
  399488007, // Uveal melanoma
];

interface FhirCoding {
  system: string;
  code: string;
  display?: string;
}

interface FhirEntry {
  resource: {
    resourceType: string;
    id?: string;
    code?: { coding?: FhirCoding[] };
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
  return crypto
    .createHash('sha256')
    .update(mrn + (process.env.MRN_SALT ?? 'autocase-salt'))
    .digest('hex')
    .slice(0, 32);
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
  return {
    isRare: matchedCodes.length > 0,
    reason: matchedCodes.join(', '),
  };
}

export async function POST(req: Request) {
  try {
    const bundle: FhirBundle = await req.json();

    if (bundle.resourceType !== 'Bundle') {
      return NextResponse.json({ error: 'Expected FHIR Bundle' }, { status: 400 });
    }

    const entries = bundle.entry ?? [];

    // Extract patient and conditions from bundle
    const patientEntry = entries.find((e) => e.resource.resourceType === 'Patient');
    const conditions = entries.filter((e) => e.resource.resourceType === 'Condition');
    const documentRefs = entries.filter((e) => e.resource.resourceType === 'DocumentReference');

    if (!patientEntry) {
      return NextResponse.json({ error: 'No Patient resource in bundle' }, { status: 400 });
    }

    // Check for rare oncology conditions
    const { isRare, reason } = detectRareCase(conditions);

    if (!isRare) {
      return NextResponse.json({
        flagged: false,
        message: 'No rare oncology codes detected',
      });
    }

    // Hash patient MRN for de-identification
    const mrn = patientEntry.resource.id ?? crypto.randomUUID();
    const hashedMrn = hashMrn(mrn);

    // Collect clinical text for LLM processing
    const clinicalText = [
      ...conditions.map((c) => c.resource.text?.div ?? ''),
      ...documentRefs.flatMap((d) =>
        (d.resource.content ?? []).map((c) =>
          Buffer.from(c.attachment.data, 'base64').toString('utf-8')
        )
      ),
    ]
      .filter(Boolean)
      .join('\n\n');

    // Upsert OMOP Person — find or create
    let person = await prisma.person.findFirst({
      where: { person_source_value: hashedMrn },
    });

    if (!person) {
      person = await prisma.person.create({
        data: {
          person_source_value: hashedMrn,
          gender_concept_id: 8521, // Unknown/Other
          year_of_birth: 0,
          race_concept_id: 0,
          ethnicity_concept_id: 0,
        },
      });
    }

    // Create clinical case
    const clinicalCase = await prisma.clinicalCase.create({
      data: {
        person_id: person.person_id,
        fhir_bundle: bundle as object,
        icd10_codes: reason,
        status: 'PENDING_CONSENT',
        flagged_at: new Date(),
      },
    });

    // Async LLM OMOP extraction (non-blocking)
    if (clinicalText) {
      processEmrToOmop(clinicalCase.case_id, clinicalText).catch(console.error);
    }

    return NextResponse.json({
      flagged: true,
      reason,
      case_id: clinicalCase.case_id,
      person_id: person.person_id,
      message: 'Rare oncology case flagged. Awaiting patient consent.',
    });
  } catch (error) {
    console.error('[FHIR Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
