import { prisma } from '@/lib/prisma';
import Link from 'next/link';

const S = {
  page: { minHeight: '100vh', background: '#0a0a0b', color: '#f8fafc', padding: '24px', fontFamily: 'system-ui, sans-serif' } as React.CSSProperties,
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 700, margin: 0 },
  backLink: { fontSize: 14, color: '#10b981', textDecoration: 'none' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 },
  card: { padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' },
  statValue: { fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 4 },
  statLabel: { fontSize: 14, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 },
  section: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { textAlign: 'left' as const, fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#64748b', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  td: { padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 14 },
  status: { padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  empty: { padding: '40px 0', textAlign: 'center' as const, color: '#64748b' },
};

async function getDashboardData() {
  try {
    const [totalCases, pendingConsent, published, recentRevenue] = await Promise.all([
      prisma.caseReport.count(),
      prisma.caseReport.count({ where: { status: 'CONSENT_PENDING' } }),
      prisma.caseReport.findMany({
        where: { status: 'PUBLISHED' },
        include: { person: { include: { consent: true } } },
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
      prisma.rweQuery.aggregate({
        _sum: { payment_amount: true },
        where: { created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
    ]);
    return {
      totalCases,
      pendingConsent,
      published,
      monthlyRevenue: recentRevenue._sum.payment_amount ?? 0,
    };
  } catch (e) {
    return { totalCases: 0, pendingConsent: 0, published: [], monthlyRevenue: 0 };
  }
}

export default async function DashboardPage() {
  const { totalCases, pendingConsent, published, monthlyRevenue } = await getDashboardData();

  const stats = [
    { label: 'Cases Flagged', value: totalCases, icon: '🔍' },
    { label: 'Pending Consent', value: pendingConsent, icon: '⏳' },
    { label: 'OMOP Published', value: published.length, icon: '📦' },
    { label: '30D Revenue', value: `$${monthlyRevenue.toLocaleString()}`, icon: '💰' },
  ];

  return (
    <div style={S.page}>
      <header style={S.header}>
        <h1 style={S.title}>Clinical Dashboard</h1>
        <Link href="/" style={S.backLink}>&larr; Home</Link>
      </header>

      <div style={S.grid}>
        {stats.map((stat) => (
          <div key={stat.label} style={S.card}>
            <div style={S.statValue}>{stat.value}</div>
            <div style={S.statLabel}>
              <span>{stat.icon}</span>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={S.section}>
        <h2 style={S.sectionTitle}>
          <span>📋</span> Recent Published Cases (OMOP v5.4)
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Case ID</th>
                <th style={S.th}>Patient Source</th>
                <th style={S.th}>OMOP Mapping</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Solana Attestation</th>
              </tr>
            </thead>
            <tbody>
              {published.length > 0 ? (
                published.map((c: any) => (
                  <tr key={c.case_id}>
                    <td style={S.td}>#{c.case_id}</td>
                    <td style={S.td}>{c.person_source_value}</td>
                    <td style={S.td}>
                      <span style={{ color: '#10b981' }}>Active</span>
                    </td>
                    <td style={S.td}>
                      <span style={{ ...S.status, background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>PUBLISHED</span>
                    </td>
                    <td style={S.td}>
                      <code style={{ fontSize: 11, color: '#64748b' }}>
                        {c.tx_hash ? `${c.tx_hash.slice(0, 8)}...` : 'N/A'}
                      </code>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={S.empty}>No published cases found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
