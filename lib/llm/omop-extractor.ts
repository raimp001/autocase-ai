// lib/llm/omop-extractor.ts
// TASK-5: OpenAI GPT-4o powered OMOP abstraction from raw EMR text
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

// Lazy OpenAI initialization to avoid build-time errors when env var is absent
function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not configured');
  return new OpenAI({ apiKey: key });
}

export interface OmopCondition {
  concept_id: number;          // SNOMED-CT
  source_value: string;        // ICD-10 or ICD-O source code
  start_date: string;          // ISO date string
  end_date?: string;
  status_concept_id?: number;  // OMOP Oncology: primary=4033240, met=4205430
  confidence: number;          // 0-1, abstractor confidence
}

export interface OmopDrug {
  concept_id: number;          // RxNorm / HemOnc
  source_value: string;        // Drug name from note
  start_date: string;
  end_date?: string;
  route_concept_id?: number;
  line_of_therapy?: number;    // 1L, 2L, etc.
}

export interface OmopMeasurement {
  concept_id: number;          // LOINC
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
  deidentified_text: string;
  confidence_score: number;
}

export async function processEmrToOmop(
  rawNoteText: string,
  caseReportId: number
): Promise<OmopAbstraction> {
  const openai = getOpenAI();

  const systemPrompt = `You are a clinical NLP system specialized in oncology OMOP CDM v5.4 abstraction.
Your task:
1. Extract all conditions, drugs, and measurements from the clinical note
2. Map each to OMOP standard concepts (SNOMED-CT for conditions, RxNorm for drugs, LOINC for labs)
3. De-identify all PHI (names, dates->relative, MRNs, addresses)
4. Return ONLY valid JSON matching the OmopAbstraction schema
5. Focus on rare oncology: mesothelioma, adrenocortical carcinoma, uveal melanoma, MCC, appendiceal
6. Flag ICD-10 codes: C38.4, C45.9, C48.2, C74.0, C44.20, C69.3, C18.1, C80.1
Schema:
{
  "conditions": [{"concept_id": number, "source_value": string, "start_date": string, "confidence": number}],
  "drugs": [{"concept_id": number, "source_value": string, "start_date": string}],
  "measurements": [{"concept_id": number, "source_value": string, "date": string}],
  "narrative_summary": string,
  "deidentified_text": string,
  "confidence_score": number
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Extract OMOP data from this clinical note:\n\n${rawNoteText}` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty response');

  const abstraction = JSON.parse(content) as OmopAbstraction;

  // Store the processed extraction result as ai_summary
  await prisma.caseReport.update({
    where: { case_id: caseReportId },
    data: {
      ai_summary: abstraction.narrative_summary,
      status: 'OMOP_EXTRACTED',
    },
  });

  return abstraction;
}
