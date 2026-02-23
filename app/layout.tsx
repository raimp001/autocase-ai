import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoCase AI — Oncology RWE Platform',
  description:
    'Autonomous Clinical Case Repository: OMOP-compliant real-world evidence platform with SMART on FHIR ingestion, OpenAI GPT-4o de-identification, Stripe B2B API gateway, and Solana micro-royalty engine.',
  keywords: [
    'oncology',
    'RWE',
    'real-world evidence',
    'OMOP CDM',
    'FHIR',
    'clinical data',
    'Solana',
    'pharma API',
    'DeSci',
    'OHSU',
    'hematology',
    'Coinbase',
  ],
  openGraph: {
    title: 'AutoCase AI — Oncology RWE Platform',
    description: 'Autonomous clinical case repository for rare oncology real-world evidence.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0b] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
