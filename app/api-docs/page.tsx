import Link from 'next/link';

const S = {
  page: { minHeight: '100vh', background: '#0a0a0b', color: '#f8fafc', padding: '40px 24px', fontFamily: 'system-ui, sans-serif' } as React.CSSProperties,
  container: { maxWidth: 1000, margin: '0 auto' },
  header: { marginBottom: 48 },
  title: { fontSize: 32, fontWeight: 700, marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#94a3b8', lineHeight: 1.6 },
  section: { marginBottom: 60 },
  sectionTitle: { fontSize: 20, fontWeight: 600, color: '#10b981', marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid rgba(16,185,129,0.2)' },
  endpointCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 24 },
  methodRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  method: { padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, background: '#10b981', color: '#000' },
  path: { fontFamily: 'monospace', fontSize: 14, color: '#fff' },
  desc: { fontSize: 14, color: '#94a3b8', lineHeight: 1.5, marginBottom: 20 },
  codeBlock: { background: '#000', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' as const, marginBottom: 16 },
  code: { fontFamily: 'monospace', fontSize: 13, color: '#cbd5e1', whiteSpace: 'pre' as const },
  label: { fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, marginBottom: 8, display: 'block' },
};

const endpoints = [
  {
    method: 'POST',
    path: '/api/fhir/webhook',
    title: 'FHIR Oncology Webhook',
    description: 'Receives SMART on FHIR events, detects rare oncology ICD-10 codes, de-identifies notes, and creates OMOP records.',
    request: `{
  "resourceType": "Encounter",
  "subject": { "reference": "Patient/12345" },
  "reasonCode": [{ "coding": [{ "code": "C83.3", "display": "DLBCL" }] }]
}`,
    response: `{
  "flagged": true,
  "case_id": 42,
  "icd10_code": "C83.3",
  "solana_tx": "5x7K..."
}`
  },
  {
    method: 'GET',
    path: '/api/rwe/query',
    title: 'B2B RWE Query',
    description: 'Stripe-gated endpoint for querying de-identified clinical evidence. Requires pharma API key.',
    request: `GET /api/rwe/query?concept_id=43531010&min_age=18`,
    response: `{
  "concept_name": "Invasive ductal carcinoma",
  "patient_count": 1284,
  "micro_royalty_distributed": 12.50
}`
  }
];

export default function ApiDocsPage() {
  return (
    <div style={S.page}>
      <div style={S.container}>
        <header style={S.header}>
          <Link href="/" style={{ color: '#10b981', textDecoration: 'none', fontSize: 14, display: 'block', marginBottom: 16 }}>&larr; Back Home</Link>
          <h1 style={S.title}>API Documentation</h1>
          <p style={S.subtitle}>
            AutoCase AI provides a high-performance interface for both EMR integration and B2B RWE queries. 
            All data is processed through our HIPAA-compliant de-identification pipeline.
          </p>
        </header>

        <section style={S.section}>
          <h2 style={S.sectionTitle}>System Endpoints</h2>
          {endpoints.map((ep) => (
            <div key={ep.path} style={S.endpointCard}>
              <div style={S.methodRow}>
                <span style={S.method}>{ep.method}</span>
                <span style={S.path}>{ep.path}</span>
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>{ep.title}</h3>
              <p style={S.desc}>{ep.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <span style={S.label}>Request Example</span>
                  <div style={S.codeBlock}>
                    <code style={S.code}>{ep.request}</code>
                  </div>
                </div>
                <div>
                  <span style={S.label}>Response Example</span>
                  <div style={S.codeBlock}>
                    <code style={S.code}>{ep.response}</code>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section style={S.section}>
          <h2 style={S.sectionTitle}>Architecture</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { t: 'FHIR Ingestion', d: 'SMART on FHIR webhooks for real-time flagging.' },
              { t: 'OMOP v5.4', d: 'Standardized clinical data model for cross-institutional research.' },
              { t: 'De-identification', d: 'OpenAI GPT-4 powered redaction of 18 HIPAA identifiers.' }
            ].map(f => (
              <div key={f.t} style={{ padding: 20, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: '#fff', marginBottom: 8 }}>{f.t}</h4>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
