import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-mono text-green-400 uppercase tracking-widest">System Online</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Autonomous Clinical
            <br />
            <span className="text-green-400">Case Repository</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            OMOP-compliant real-world evidence platform with SMART on FHIR ingestion,
            LLM de-identification, Stripe B2B API gateway, and Solana micro-royalty engine
            for oncology data.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
            >
              View Dashboard
            </Link>
            <a
              href="https://github.com/raimp001/autocase-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-gray-700 hover:border-green-600 text-gray-300 hover:text-green-400 font-semibold rounded-lg transition-colors"
            >
              GitHub Repo
            </a>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: '🏥',
              title: 'SMART on FHIR',
              desc: 'Epic EHR integration. Autonomous rare oncology case flagging via ICD-10 filters.',
            },
            {
              icon: '🧠',
              title: 'LLM Extraction',
              desc: 'Claude-powered OMOP CDM mapping. De-identified clinical narratives to structured data.',
            },
            {
              icon: '💳',
              title: 'Stripe RWE API',
              desc: 'Metered B2B access for pharma. Pay-per-query pricing with API key management.',
            },
            {
              icon: '⚡',
              title: 'Solana Royalties',
              desc: '5% patient + 3% physician micro-royalties on every data access. On-chain transparency.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-800 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* API endpoint showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">RWE API Endpoints</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 font-mono text-sm space-y-4">
          {[
            { method: 'POST', path: '/api/fhir/webhook', desc: 'FHIR R4 resource ingestion' },
            { method: 'POST', path: '/api/consent', desc: 'Patient e-consent capture + Solana tx' },
            { method: 'POST', path: '/api/rwe/query', desc: 'Pharma RWE query (Stripe metered)' },
          ].map((e) => (
            <div key={e.path} className="flex items-center gap-4">
              <span className="px-2 py-0.5 text-xs bg-green-900 text-green-300 border border-green-800 rounded w-14 text-center">
                {e.method}
              </span>
              <span className="text-green-400">{e.path}</span>
              <span className="text-gray-500">— {e.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
