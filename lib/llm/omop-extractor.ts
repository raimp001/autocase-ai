// lib/llm/omop-extractor.ts
// TASK-5: Claude-powered OMOP abstraction from raw EMR text
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface OmopCondition {
  concept_id: number;       // SNOMED-CT
  source_value: string;     // ICD-10 or ICD-O source code
  start_date: string;       // ISO date string
  end_date?: string;
  status_concept_id?: number; // OMOP Oncology: primary=4033240, met=4205430
  confidence: number;       // 0-1, abstractor confidence
}

export interface OmopDrug {
  concept_id: number;       // RxNorm / HemOnc
  source_value: string;     // Drug name from note
  start_date: string;
  end_date?: string;
  route_concept_id?: number;
  line_of_therapy?: number; // 1L, 2L, etc.
}

export interface OmopMeasurement {
  concept_id: number;       // LOINC
  source_value: string;
  date: string;
  value_as_number?: number;
  value_as_concept_id?: number; // Positive=9191, Negative=9189
  unit_concept_id?: number;
}

export interface OmopAbstraction {
  conditions: OmopCondition[];
  drugs: OmopDrug[];
  measurements: OmopMeasurement[];
  narrative_summary: string;
  rare_flag_reasoning: string;
  overall_confidence: number;
}

const SYSTEM_PROMPT = `You are a board-certified oncology clinical data abstractor.
Your role is to extract structured OMOP CDM v5.4 data from clinical narratives.

Rules:
- Return ONLY valid JSON matching the OmopAbstraction schema
- Use real SNOMED-CT concept_ids for conditions (e.g. 363346000=malignant neoplasm)
- Use real LOINC codes for measurements (e.g. 85319-2=EGFR mutation, 10334-1=AFP)
- Use real RxNorm concept_ids for drugs (e.g. 1657071=osimertinib)
- Never include patient name, DOB, MRN, or any PHI in output
- Set confidence 0.0-1.0 based on how explicitly stated the finding is
- For rare case reasoning, cite specific ICD/SNOMED codes and clinical context`;

export async function processEmrToOmop(caseId: number): Promise<OmopAbstraction> {
  const caseReport = await prisma.caseReport.findUnique({
    where: { case_id: caseId },
  });

  if (!caseReport) throw new Error(`CaseReport ${caseId} not found`);

  const msg = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Extract OMOP CDM structured data from the following clinical narrative.
Return a JSON object with this exact schema:
{
  "conditions": [{"concept_id": number, "source_value": string, "start_date": "YYYY-MM-DD", "confidence": number}],
  "drugs": [{"concept_id": number, "source_value": string, "start_date": "YYYY-MM-DD", "line_of_therapy": number}],
  "measurements": [{"concept_id": number, "source_value": string, "date": "YYYY-MM-DD", "value_as_number": number}],
  "narrative_summary": "2-3 sentence oncology case summary",
  "rare_flag_reasoning": "Explanation of why this is a rare case",
  "overall_confidence": number
}

CLINICAL NARRATIVE:
${caseReport.emr_narrative}`,
      },
    ],
  });

  const rawText = (msg.content[0] as { type: 'text'; text: string }).text;

  // Extract JSON from response (handle markdown code blocks if present)
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawText];
  const abstraction: OmopAbstraction = JSON.parse(jsonMatch[1]?.trim() ?? rawText);

  // Write structured OMOP data to Prisma
  for (const cond of abstraction.conditions) {
    if (cond.confidence >= 0.7) {
      await prisma.conditionOccurrence.create({
        data: {
          person_id: caseReport.person_id,
          condition_concept_id: cond.concept_id,
          condition_start_date: new Date(cond.start_date),
          condition_end_date: cond.end_date ? new Date(cond.end_date) : null,
          condition_type_concept_id: 32020, // EHR encounter
          condition_source_value: cond.source_value,
          condition_status_concept_id: cond.status_concept_id ?? null,
        },
      });
    }
  }

  for (const drug of abstraction.drugs) {
    await prisma.drugExposure.create({
      data: {
        person_id: caseReport.person_id,
        drug_concept_id: drug.concept_id,
        drug_exposure_start_date: new Date(drug.start_date),
        drug_exposure_end_date: drug.end_date ? new Date(drug.end_date) : null,
        drug_type_concept_id: 32817, // EHR order
        drug_source_value: drug.source_value,
        route_concept_id: drug.route_concept_id ?? null,
      },
    });
  }

  for (const meas of abstraction.measurements) {
    await prisma.measurement.create({
      data: {
        person_id: caseReport.person_id,
        measurement_concept_id: meas.concept_id,
        measurement_date: new Date(meas.date),
        measurement_type_concept_id: 32856, // Lab result
        value_as_number: meas.value_as_number ?? null,
        value_as_concept_id: meas.value_as_concept_id ?? null,
        measurement_source_value: meas.source_value,
      },
    });
  }

  // Update case status and summary
  await prisma.caseReport.update({
    where: { case_id: caseId },
    data: {
      status: 'PUBLISHED',
      ai_summary: abstraction.narrative_summary,
      rare_flag_reason: abstraction.rare_flag_reasoning,
    },
  });

  return abstraction;
}
