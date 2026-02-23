'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ConsentPortal() {
  const [step, setStep] = useState<'intro' | 'form' | 'success'>('intro');
  const [formData, setFormData] = useState({
    personId: '',
    walletAddress: '',
    optInRwe: true,
    tier: 2,
    consentText: 'AutoCaseAI Standard Oncology Data Consent v1.0',
  });
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.personId) {
      setError('Patient ID is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Consent submission failed');
      } else {
        setTxHash(data.solana_tx_hash || data.consent?.consent_hash || 'recorded');
        setStep('success');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-100">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-sm font-bold">A</span>
            </div>
            <span className="font-semibold text-white">AutoCase AI</span>
          </div>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Platform Home
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {step === 'intro' && (
          <div>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Blockchain-Verified Consent
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Patient e-Consent Portal</h1>
              <p className="text-slate-400 leading-relaxed">
                Your consent is cryptographically hashed and attested on the Solana blockchain, 
                creating an immutable audit trail that ensures your data sovereignty.
              </p>
            </div>

            <div className="grid gap-4 mb-8">
              {[
                { icon: '\uD83D\uDD10', title: 'Cryptographic Proof', desc: 'SHA-256 hash of your consent payload is stored on-chain via Solana Memo program.' },
                { icon: '\uD83D\uDCCA', title: 'OMOP-Compliant', desc: 'Your consent record follows OMOP CDM v5.4 standards for interoperability.' },
                { icon: '\uD83D\uDCB0', title: 'Royalty Eligible', desc: 'Opt-in patients receive 50% of downstream RWE query revenue via Solana USDC.' },
                { icon: '\uD83D\uDEE1\uFE0F', title: 'Revocable', desc: 'You can withdraw consent at any time. Revocation is also recorded on-chain.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('form')}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all"
            >
              Begin Consent Process
            </button>
          </div>
        )}

        {step === 'form' && (
          <div>
            <button onClick={() => setStep('intro')} className="text-sm text-slate-400 hover:text-white mb-6 flex items-center gap-1">
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Consent Registration</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Patient ID *</label>
                <input
                  type="text"
                  value={formData.personId}
                  onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                  placeholder="Enter your patient ID"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Solana Wallet Address (Optional)</label>
                <input
                  type="text"
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  placeholder="7xKX... (for royalty payments)"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">Required to receive USDC royalty distributions</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="font-semibold text-white text-sm mb-3">Data Sharing Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.optInRwe}
                      onChange={(e) => setFormData({ ...formData, optInRwe: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded accent-emerald-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-white">Opt-in to Real-World Evidence Research</span>
                      <p className="text-xs text-slate-400 mt-0.5">Allow de-identified oncology data for pharmaceutical research queries</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Consent Tier</label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  <option value={1}>Tier 1 — Aggregate statistics only</option>
                  <option value={2}>Tier 2 — De-identified individual records</option>
                  <option value={3}>Tier 3 — Full OMOP cohort participation</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <p className="text-xs text-blue-300 leading-relaxed">
                  <strong className="text-blue-200">Consent Statement:</strong> {formData.consentText}<br /><br />
                  By proceeding, you acknowledge that your consent record will be cryptographically attested 
                  on the Solana Devnet blockchain as an immutable audit trail.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black font-semibold rounded-xl transition-all"
              >
                {loading ? 'Recording on Solana...' : 'Submit Consent & Attest On-Chain'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">\u2713</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Consent Recorded</h2>
            <p className="text-slate-400 mb-6">Your consent has been cryptographically attested on the Solana blockchain.</p>
            {txHash && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left mb-6">
                <p className="text-xs text-slate-500 mb-1">Blockchain Transaction Hash</p>
                <p className="font-mono text-sm text-emerald-400 break-all">{txHash}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard" className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all text-sm">
                View Dashboard
              </Link>
              <Link href="/" className="px-6 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl transition-all text-sm">
                Platform Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
