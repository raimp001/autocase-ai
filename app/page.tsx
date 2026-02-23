import Link from 'next/link';

const stats = [
  { label: 'Cases Flagged', value: '2,847', delta: '+12% this month' },
  { label: 'Consents Secured', value: '1,923', delta: '67.5% rate' },
  { label: 'RWE Queries', value: '341', delta: '$48.2K revenue' },
  { label: 'Royalties Paid', value: '$12.4K', delta: 'via Solana' },
];

const features = [
  {
    icon: '🔬',
    title: 'FHIR Oncology Flagging',
    description: 'Autonomous SMART on FHIR webhook monitors EMR streams and flags rare oncology cases using ICD-10 criteria in real time.',
    tag: 'AI-Powered',
  },
  {
    icon: '🔒',
    title: 'Patient e-Consent',
    description: 'Blockchain-attested consent via Solana ensures immutable audit trails and patient data sovereignty for every case.',
    tag: 'Web3 Native',
  },
  {
    icon: '🧠',
    title: 'LLM OMOP Extraction',
    description: 'GPT-4 powered clinical narrative extraction maps unstructured notes to OMOP CDM v5.4 with de-identification.',
    tag: 'OpenAI GPT-4',
  },
  {
    icon: '📊',
    title: 'B2B RWE API',
    description: 'Stripe-gated real-world evidence query API for pharma and research institutions with structured OMOP outputs.',
    tag: 'Revenue-Ready',
  },
  {
    icon: '💎',
    title: 'Micro-Royalty Engine',
    description: 'Automated Solana royalty distributions to contributing clinicians when their case data generates downstream value.',
    tag: 'DeSci',
  },
  {
    icon: '🏥',
    title: 'Coinbase Smart Wallet',
    description: 'Seamless Web3 onboarding for clinicians with Coinbase Smart Wallet — no seed phrases, full self-custody.',
    tag: 'Coinbase CDP',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-100">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-emerald-600/8 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <span className="text-emerald-400 text-sm font-bold">A</span>
              </div>
              <span className="font-semibold text-white">AutoCase AI</span>
              <span className="hidden sm:block text-xs text-slate-500 border border-slate-700 rounded px-2 py-0.5">OHSU · Oncology RWE</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-1.5 text-sm bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            System Online · FHIR Webhook Active
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Autonomous Clinical</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Case Repository
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
            OMOP-compliant real-world evidence platform with SMART on FHIR ingestion,
            GPT-4 de-identification, Stripe B2B API gateway, and Solana micro-royalty
            engine for rare oncology data.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              Open Clinical Dashboard
            </Link>
            <a
              href="https://github.com/raimp001/autocase-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-xl transition-all"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:bg-white/5 transition-all">
              <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-sm text-slate-400 mb-2">{s.label}</div>
              <div className="text-xs text-emerald-400">{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-2">Platform Capabilities</h2>
          <p className="text-slate-400 text-center mb-10">Full-stack DeSci infrastructure for oncology real-world evidence</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="group bg-white/3 border border-white/8 rounded-2xl p-6 hover:bg-white/5 hover:border-emerald-500/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl">{f.icon}</span>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">{f.tag}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
          <h3 className="text-white font-semibold mb-6">Technology Stack</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['Next.js 15', 'Prisma + OMOP v5.4', 'PostgreSQL / Neon', 'OpenAI GPT-4', 'Solana Web3.js', 'Coinbase CDP', 'Stripe API', 'Tailwind CSS', 'Vercel'].map((t) => (
              <span key={t} className="px-3 py-1.5 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-300 text-sm">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
            <span>AutoCase AI · OHSU Oncology RWE Platform</span>
            <span>Built for DeSci · Powered by Solana &amp; Coinbase</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
