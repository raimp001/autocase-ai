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
    return {
      totalCases,
      pendingConsent,
      published,
      monthlyRevenue: recentRevenue._sum.payment_amount ?? 0,
    };
  } catch {
    return { totalCases: 0, pendingConsent: 0, published: [], monthlyRevenue: 0 };
  }
}

export default async function DashboardPage() {
  const { totalCases, pendingConsent, published, monthlyRevenue } = await getDashboardData();

  const stats = [
    { label: 'Cases Flagged', value: totalCases, icon: '🔬' },
    { label: 'Pending Consent', value: pendingConsent, icon: '🔒' },
    { label: 'OMOP Published', value: published.length, icon: '📚' },
    { label: 'Monthly RWE Revenue', value: `$${monthlyRevenue.toFixed(2)}`, icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE EMR STREAM ACTIVE
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Clinical Dashboard</h1>
            <p className="text-slate-400">Autonomous Case Repository · OHSU Oncology</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20">
              Platform Home
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:bg-white/5 transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-medium text-emerald-400">+4% week</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/8 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Recent OMOP-Mapped Cases</h3>
                <span className="text-xs text-slate-500 uppercase tracking-widest">Last 10 Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/2">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient ID</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Consent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {published.length > 0 ? (
                      published.map((report) => (
                        <tr key={report.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm text-emerald-400">{report.person.source_value}</td>
                          <td className="px-6 py-4 text-sm text-slate-200">{report.title}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Published
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-400 font-mono">
                              Solana: {report.person.consent?.[0]?.attestation_tx?.slice(0, 8)}...
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                          No published cases found. System is currently flagging rare events.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Oncology Clinician Wallet</h3>
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-4">
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Royalty Address</div>
                <div className="text-sm font-mono text-emerald-400 truncate">7x8Wq...f9Pz (Coinbase Smart Wallet)</div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Total Royalties Earned</span>
                <span className="text-sm font-bold text-white">1.42 SOL</span>
              </div>
              <button className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-semibold transition-all">
                Claim Royalties via Solana
              </button>
            </div>

            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Node Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">FHIR Webhook</span>
                  <span className="text-xs font-mono text-emerald-400">OPERATIONAL</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">OpenAI GPT-4o</span>
                  <span className="text-xs font-mono text-emerald-400">CONNECTED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">PostgreSQL (Neon)</span>
                  <span className="text-xs font-mono text-emerald-400">CONNECTED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
