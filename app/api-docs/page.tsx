import Link from 'next/link';

const endpoints = [
  {
    method: 'POST',
    path: '/api/fhir/webhook',
    title: 'FHIR Oncology Webhook',
    description: 'Receives SMART on FHIR events, detects rare oncology ICD-10 codes, runs LLM de-identification, and creates OMOP records.',
    auth: 'FHIR_WEBHOOK_SECRET header',
    requestExample: `{
  "resourceType": "Encounter",
  "subject": { "reference": "Patient/12345" },
  "reasonCode": [{ "coding": [{ "code": "C83.3", "display": "Diffuse large B-cell lymphoma" }] }]
}`,
    responseExample: `{
  "flagged": true,
  "case_id": 42,
  "icd10_code": "C83.3",
  "omop_condition_id": 4,
  "solana_tx": "5x7K..."
}`,
    tags: ['FHIR', 'OMOP', 'LLM'],
  },
  {
    method: 'POST',
    path: '/api/consent',
    title: 'Patient e-Consent',
    description: 'Records patient consent with SHA-256 hash and Solana on-chain attestation for immutable audit trail.',
    auth: 'None (patient-facing)',
    requestExample: `{
  "personId": "12345",
  "walletAddress": "7xKX...",
  "optInRwe": true,
  "tier": 2,
  "consentText": "AutoCaseAI Standard Oncology Data Consent v1.0"
}`,
    responseExample: `{
  "consent": { "person_id": 12345, "status": "GRANTED" },
  "consent_hash": "a3f9...",
  "solana_tx_hash": "5xKP..."
}`,
    tags: ['Consent', 'Solana', 'OMOP'],
  },
  {
    method: 'POST',
    path: '/api/rwe/query',
    title: 'B2B RWE Query',
    description: 'Stripe-authenticated endpoint for pharmaceutical clients to query OMOP cohorts. Triggers royalty distribution on success.',
    auth: 'Bearer <API_KEY>',
    requestExample: `{
  "snomedConceptId": "413448000",
  "queryPaymentAmount": 1000,
  "clientName": "Pharma Inc",
  "stripePaymentIntentId": "pi_..."
}`,
    responseExample: `{
  "query_id": "rwe_...",
  "cohort_size": 47,
  "omop_results": [...],
  "royalty_tx": "9kPX...",
  "payment_split": { "platform": 200, "physicians": 300, "patients": 500 }
}`,
    tags: ['Stripe', 'B2B', 'Solana', 'OMOP'],
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  POST: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-100">
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-sm font-bold">A</span>
            </div>
            <span className="font-semibold text-white">AutoCase AI</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 text-sm">API Reference</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Home</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            B2B API Gateway
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">RWE API Reference</h1>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            Stripe-authenticated REST API for pharmaceutical and research clients to query 
            de-identified OMOP oncology cohorts. Every successful query triggers automatic 
            USDC royalty distribution to contributing clinicians and patients via Solana.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          {[
            { label: 'Base URL', value: 'https://autocase-ai.vercel.app/api', icon: '🌐' },
            { label: 'Auth Type', value: 'Bearer Token (Stripe-issued)', icon: '🔑' },
            { label: 'Data Format', value: 'OMOP CDM v5.4 JSON', icon: '📊' },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-lg mb-2 block">{item.icon}</span>
              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
              <p className="text-sm font-mono text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {endpoints.map((ep) => (
            <div key={ep.path} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="p-6 border-b border-white/[0.06]">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${methodColors[ep.method] || ''}`}>
                      {ep.method}
                    </span>
                    <code className="text-sm font-mono text-slate-200">{ep.path}</code>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {ep.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-slate-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-2">{ep.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{ep.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Auth:</span>
                  <code className="text-xs font-mono text-amber-400">{ep.auth}</code>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
                <div className="p-5">
                  <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">Request Body</p>
                  <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">{ep.requestExample}</pre>
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">Response</p>
                  <pre className="text-xs font-mono text-emerald-400/80 leading-relaxed overflow-x-auto whitespace-pre-wrap">{ep.responseExample}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
          <h3 className="font-semibold text-white mb-2">💰 Revenue Split Model</h3>
          <p className="text-slate-400 text-sm mb-4">Every RWE query payment is automatically distributed via Solana USDC SPL tokens:</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Platform', pct: '20%', desc: 'Infrastructure & operations' },
              { label: 'Physicians', pct: '30%', desc: 'Per contributing clinician' },
              { label: 'Patients', pct: '50%', desc: 'Equal per-capita distribution' },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-2xl font-bold text-emerald-400 mb-1">{item.pct}</p>
                <p className="font-semibold text-white text-sm mb-1">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
