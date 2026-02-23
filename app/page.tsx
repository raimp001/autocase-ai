import Link from 'next/link';

const stats = [
  { label: 'Cases Flagged', value: '2,847', delta: '+12% this month' },
  { label: 'Consents Secured', value: '1,923', delta: '67.5% rate' },
  { label: 'RWE Queries', value: '341', delta: '$48.2K revenue' },
  { label: 'Royalties Paid', value: '$12.4K', delta: 'via Solana' },
];

const features = [
  {
    icon: '\uD83E\uDDA0',
    title: 'FHIR Oncology Flagging',
    description: 'Autonomous SMART on FHIR webhook monitors EMR streams and flags rare oncology cases using ICD-10 criteria in real time.',
    tag: 'AI-Powered',
    href: null,
  },
  {
    icon: '\uD83D\uDD10',
    title: 'Patient e-Consent',
    description: 'Blockchain-attested consent via Solana ensures immutable audit trails and patient data sovereignty for every case.',
    tag: 'Web3 Native',
    href: '/consent',
  },
  {
    icon: '\uD83E\uDDE0',
    title: 'LLM OMOP Extraction',
    description: 'GPT-4 powered clinical narrative extraction maps unstructured notes to OMOP CDM v5.4 with de-identification.',
    tag: 'OpenAI GPT-4',
    href: null,
  },
  {
    icon: '\uD83D\uDCCA',
    title: 'B2B RWE API',
    description: 'Stripe-gated real-world evidence query API for pharma and research institutions with structured OMOP outputs.',
    tag: 'Revenue-Ready',
    href: '/api-docs',
  },
  {
    icon: '\uD83D\uDCB8',
    title: 'Micro-Royalty Engine',
    description: 'Automated Solana royalty distributions to contributing clinicians when their case data generates downstream value.',
    tag: 'DeSci',
    href: null,
  },
  {
    icon: '\uD83D\uDCF1',
    title: 'Coinbase Smart Wallet',
    description: 'Seamless Web3 onboarding for clinicians with Coinbase Smart Wallet \u2014 no seed phrases, full self-custody.',
    tag: 'Coinbase CDP',
    href: null,
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
                <span className="text-emerald-400 font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-white">AutoCase AI</span>
              <span className="hidden sm:block text-xs text-slate-500 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full">OHSU \u00B7 Oncology RWE</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/consent" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Consent</Link>
              <Link href="/api-docs" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">API Docs</Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              System Online \u00B7 FHIR Webhook Active
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
              Autonomous Clinical
              <br />
              <span className="text-emerald-400">Case Repository</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-2xl">
              OMOP-compliant real-world evidence platform with SMART on FHIR ingestion, 
              GPT-4 de-identification, Stripe B2B API gateway, and Solana micro-royalty 
              engine for rare oncology data.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm"
              >
                Open Clinical Dashboard
              </Link>
              <Link
                href="/consent"
                className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-white font-semibold rounded-xl transition-all text-sm"
              >
                Patient e-Consent
              </Link>
              <Link
                href="/api-docs"
                className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-white font-semibold rounded-xl transition-all text-sm"
              >
                API Reference
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all">
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-slate-300 mb-1">{stat.label}</p>
                <p className="text-xs text-emerald-400">{stat.delta}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Platform Capabilities</h2>
            <p className="text-slate-400">Full-stack DeSci infrastructure for oncology real-world evidence</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const card = (
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{feature.icon}</span>
                    <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-slate-400">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  {feature.href && (
                    <p className="mt-3 text-xs text-emerald-400 font-medium">View \u2192</p>
                  )}
                </div>
              );
              return feature.href ? (
                <Link key={feature.title} href={feature.href}>{card}</Link>
              ) : (
                <div key={feature.title}>{card}</div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-8 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Built for DeSci Oncology</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              20% platform / 30% physicians / 50% patients revenue split, 
              distributed automatically on every B2B query via Solana USDC.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/api-docs"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all text-sm"
              >
                View API Docs
              </Link>
              <a
                href="https://github.com/raimp001/autocase-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-white font-semibold rounded-xl transition-all text-sm"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
