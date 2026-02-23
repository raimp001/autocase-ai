import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoCase AI — Oncology RWE Platform',
  description:
    'Autonomous Clinical Case Repository: OMOP-compliant real-world evidence platform with SMART on FHIR ingestion, LLM de-identification, Stripe B2B API gateway, and Solana micro-royalty engine.',
  keywords: [
    'oncology',
    'RWE',
    'real-world evidence',
    'OMOP',
    'FHIR',
    'clinical data',
    'Solana',
    'pharma API',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased">
        <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-lg font-bold text-green-400 tracking-tight">
                  AutoCase AI
                </span>
                <span className="text-xs text-gray-500 font-mono">RWE Platform</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <a href="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors">
                  Dashboard
                </a>
                <a href="/api/rwe/query" className="text-gray-400 hover:text-green-400 transition-colors">
                  API Docs
                </a>
                <span className="px-2 py-1 text-xs bg-green-900/50 text-green-300 border border-green-800 rounded font-mono">
                  v1.0
                </span>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
