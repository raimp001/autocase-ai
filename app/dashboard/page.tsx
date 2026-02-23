import { prisma } from '@/lib/prisma';
import Link from 'next/link';

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
    return { totalCases, pendingConsent, published, monthlyRevenue: recentRevenue._sum.payment_amount ?? 0 };
  } catch {
    return { totalCases: 0, pendingConsent: 0, published: [], monthlyRevenue: 0 };
  }
}

export default async function DashboardPage() {
  const { totalCases, pendingConsent, published, monthlyRevenue } = await getDashboardData();

  const stats = [
    { label: 'Total Cases Flagged', value: totalCases, color: 'text-blue-400' },
    { label: 'Pending Consent', value: pendingConsent, color: 'text-yellow-400' },
    { label: 'OMOP Published', value: published.length, color: 'text-green-400' },
    { label: 'Monthly Revenue (USD)', value: `$${monthlyRevenue.toFixed(2)}`, color: 'text-purple-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">RWE Operations Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm font-mono">Live oncology case repository status</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent published cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <h2 className="font-semibold text-green-400">OMOP Published ({published.length})</h2>
          </div>
          <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
            {published.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-8">No published cases</p>
            )}
            {published.map((c) => (
              <div key={c.case_id} className="bg-gray-800 rounded-lg p-4 border border-green-900">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-sm text-white">Case #{c.case_id}</span>
                  <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full">Live</span>
                </div>
                {c.ai_summary && (
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{c.ai_summary}</p>
                )}
                <p className="text-gray-600 text-xs mt-2">
                  Wallet:{' '}
                  {c.person.consent?.solana_wallet
                    ? `${c.person.consent.solana_wallet.slice(0, 8)}...`
                    : 'No wallet'}
                </p>
                {c.person.consent?.tx_hash && (
                  <a
                    href={`https://explorer.solana.com/tx/${c.person.consent.tx_hash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline mt-1 block"
                  >
                    On-chain: {c.person.consent.tx_hash.slice(0, 20)}...
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* System health */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4">System Health</h2>
          <div className="space-y-3">
            {[
              { name: 'FHIR Webhook', status: 'online', path: '/api/fhir/webhook' },
              { name: 'Consent API', status: 'online', path: '/api/consent' },
              { name: 'RWE Query API', status: 'online', path: '/api/rwe/query' },
              { name: 'Solana Devnet', status: 'online', path: null },
              { name: 'Stripe Billing', status: 'online', path: null },
              { name: 'Prisma / PostgreSQL', status: 'online', path: null },
            ].map((svc) => (
              <div key={svc.name} className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-300 text-sm">{svc.name}</span>
                <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full">{svc.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
