import Link from 'next/link';

const S = {
  page: { minHeight: '100vh', background: '#0a0a0b', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' } as React.CSSProperties,
  nav: { position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' },
  navInner: { maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', fontWeight: 700, fontSize: 13 },
  logoText: { fontWeight: 600, color: '#fff', fontSize: 16 },
  logoBadge: { fontSize: 11, color: '#64748b', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: 100 },
  navLinks: { display: 'flex', alignItems: 'center', gap: 16 },
  navLink: { fontSize: 14, color: '#94a3b8', textDecoration: 'none' },
  navBtn: { padding: '8px 16px', background: '#10b981', color: '#000', fontSize: 13, fontWeight: 600, borderRadius: 10, textDecoration: 'none' },
  main: { paddingTop: 80 },
  hero: { maxWidth: 1280, margin: '0 auto', padding: '80px 24px 60px' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', fontSize: 12, fontWeight: 500, marginBottom: 24 },
  dot: { width: 6, height: 6, borderRadius: '50%', background: '#34d399' },
  h1: { fontSize: 56, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' },
  h1accent: { color: '#34d399' },
  subtitle: { fontSize: 18, color: '#94a3b8', lineHeight: 1.6, marginBottom: 36, maxWidth: 640 },
  ctaRow: { display: 'flex', gap: 12, flexWrap: 'wrap' as const },
  ctaPrimary: { padding: '12px 24px', background: '#10b981', color: '#000', fontWeight: 600, fontSize: 14, borderRadius: 12, textDecoration: 'none' },
  ctaSecondary: { padding: '12px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: 14, borderRadius: 12, textDecoration: 'none' },
  statsSection: { maxWidth: 1280, margin: '0 auto', padding: '0 24px 60px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  statCard: { padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' },
  statValue: { fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 4 },
  statLabel: { fontSize: 13, fontWeight: 500, color: '#cbd5e1', marginBottom: 4 },
  statDelta: { fontSize: 12, color: '#34d399' },
  featuresSection: { maxWidth: 1280, margin: '0 auto', padding: '0 24px 80px' },
  featuresHeader: { marginBottom: 32 },
  featuresTitle: { fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 },
  featuresSubtitle: { color: '#94a3b8', fontSize: 15 },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  featureCard: { padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', display: 'block' },
  featureTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  featureIcon: { fontSize: 28 },
  featureTag: { padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 11, color: '#94a3b8' },
  featureTitle: { fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 },
  featureDesc: { fontSize: 14, color: '#94a3b8', lineHeight: 1.6 },
  featureArrow: { marginTop: 12, fontSize: 12, color: '#34d399', fontWeight: 500 },
  ctaSection: { maxWidth: 1280, margin: '0 auto', padding: '0 24px 80px' },
  ctaBox: { borderRadius: 20, background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.18)', padding: '60px 40px', textAlign: 'center' as const },
  ctaTitle: { fontSize: 30, fontWeight: 700, color: '#fff', marginBottom: 12 },
  ctaDesc: { color: '#94a3b8', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' },
  ctaBtns: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const },
};

const stats = [
  { label: 'Cases Flagged', value: '2,847', delta: '+12% this month' },
  { label: 'Consents Secured', value: '1,923', delta: '67.5% rate' },
  { label: 'RWE Queries', value: '341', delta: '$48.2K revenue' },
  { label: 'Royalties Paid', value: '$12.4K', delta: 'via Solana' },
];

const features = [
  { icon: '\uD83E\uDDA0', title: 'FHIR Oncology Flagging', description: 'Autonomous SMART on FHIR webhook monitors EMR streams and flags rare oncology cases using ICD-10 criteria in real time.', tag: 'AI-Powered', href: null },
  { icon: '\uD83D\uDD10', title: 'Patient e-Consent', description: 'Blockchain-attested consent via Solana ensures immutable audit trails and patient data sovereignty for every case.', tag: 'Web3 Native', href: '/consent' },
  { icon: '\uD83E\uDDE0', title: 'LLM OMOP Extraction', description: 'GPT-4 powered clinical narrative extraction maps unstructured notes to OMOP CDM v5.4 with de-identification.', tag: 'OpenAI GPT-4', href: null },
  { icon: '\uD83D\uDCCA', title: 'B2B RWE API', description: 'Stripe-gated real-world evidence query API for pharma and research institutions with structured OMOP outputs.', tag: 'Revenue-Ready', href: '/api-docs' },
  { icon: '\uD83D\uDCB8', title: 'Micro-Royalty Engine', description: 'Automated Solana royalty distributions to contributing clinicians when their case data generates downstream value.', tag: 'DeSci', href: null },
  { icon: '\uD83D\uDCF1', title: 'Coinbase Smart Wallet', description: 'Seamless Web3 onboarding for clinicians with Coinbase Smart Wallet \u2014 no seed phrases, full self-custody.', tag: 'Coinbase CDP', href: null },
];

export default function HomePage() {
  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logo}>
            <div style={S.logoIcon}>A</div>
            <span style={S.logoText}>AutoCase AI</span>
            <span style={S.logoBadge}>OHSU &middot; Oncology RWE</span>
          </div>
          <div style={S.navLinks}>
            <Link href="/consent" style={S.navLink}>Consent</Link>
            <Link href="/api-docs" style={S.navLink}>API Docs</Link>
            <Link href="/dashboard" style={S.navBtn}>Dashboard</Link>
          </div>
        </div>
      </nav>
      <main style={S.main}>
        <section style={S.hero}>
          <div style={S.badge}>
            <div style={S.dot} />
            System Online &middot; FHIR Webhook Active
          </div>
          <h1 style={S.h1}>
            Autonomous Clinical<br />
            <span style={S.h1accent}>Case Repository</span>
          </h1>
          <p style={S.subtitle}>
            OMOP-compliant real-world evidence platform with SMART on FHIR ingestion,
            GPT-4 de-identification, Stripe B2B API gateway, and Solana micro-royalty
            engine for rare oncology data.
          </p>
          <div style={S.ctaRow}>
            <Link href="/dashboard" style={S.ctaPrimary}>Open Clinical Dashboard</Link>
            <Link href="/consent" style={S.ctaSecondary}>Patient e-Consent</Link>
            <Link href="/api-docs" style={S.ctaSecondary}>API Reference</Link>
          </div>
        </section>
        <section style={S.statsSection}>
          <div style={S.statsGrid}>
            {stats.map((stat) => (
              <div key={stat.label} style={S.statCard}>
                <div style={S.statValue}>{stat.value}</div>
                <div style={S.statLabel}>{stat.label}</div>
                <div style={S.statDelta}>{stat.delta}</div>
              </div>
            ))}
          </div>
        </section>
        <section style={S.featuresSection}>
          <div style={S.featuresHeader}>
            <h2 style={S.featuresTitle}>Platform Capabilities</h2>
            <p style={S.featuresSubtitle}>Full-stack DeSci infrastructure for oncology real-world evidence</p>
          </div>
          <div style={S.featuresGrid}>
            {features.map((feature) => {
              const card = (
                <div style={S.featureCard}>
                  <div style={S.featureTop}>
                    <span style={S.featureIcon}>{feature.icon}</span>
                    <span style={S.featureTag}>{feature.tag}</span>
                  </div>
                  <div style={S.featureTitle}>{feature.title}</div>
                  <div style={S.featureDesc}>{feature.description}</div>
                  {feature.href && <div style={S.featureArrow}>View &#8594;</div>}
                </div>
              );
              return feature.href ? (
                <Link key={feature.title} href={feature.href} style={{ textDecoration: 'none' }}>{card}</Link>
              ) : (
                <div key={feature.title}>{card}</div>
              );
            })}
          </div>
        </section>
        <section style={S.ctaSection}>
          <div style={S.ctaBox}>
            <h2 style={S.ctaTitle}>Built for DeSci Oncology</h2>
            <p style={S.ctaDesc}>
              20% platform / 30% physicians / 50% patients revenue split,
              distributed automatically on every B2B query via Solana USDC.
            </p>
            <div style={S.ctaBtns}>
              <Link href="/api-docs" style={S.ctaPrimary}>View API Docs</Link>
              <a href="https://github.com/raimp001/autocase-ai" target="_blank" rel="noopener noreferrer" style={S.ctaSecondary}>View on GitHub</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
