// lib/wallet/coinbase-wallet.ts
// Coinbase Smart Wallet integration for oncology clinician royalty payments
// Uses @coinbase/wallet-sdk for Web3 onboarding without seed phrases

import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

// Initialize Coinbase Wallet SDK
const APP_NAME = 'AutoCase AI - Oncology RWE';
const APP_LOGO_URL = 'https://autocase-ai.vercel.app/logo.png';

let walletSDK: CoinbaseWalletSDK | null = null;

export function getCoinbaseWalletSDK(): CoinbaseWalletSDK {
  if (!walletSDK) {
    walletSDK = new CoinbaseWalletSDK({
      appName: APP_NAME,
      appLogoUrl: APP_LOGO_URL,
    });
  }
  return walletSDK;
}

export interface WalletConnectionResult {
  address: string;
  chainId: number;
  isSmartWallet: boolean;
}

// Creates an Ethereum provider via Coinbase Smart Wallet
export function createCoinbaseProvider() {
  const sdk = getCoinbaseWalletSDK();
  return sdk.makeWeb3Provider();
}

// Formats a wallet address for display (first 6 + last 4 chars)
export function formatWalletAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Validates an Ethereum address format
export function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Clinician royalty wallet registration
export interface ClinicianWallet {
  physicianId: string;
  ethAddress: string;    // Coinbase Smart Wallet address
  solanaAddress?: string; // For SOL royalty distributions
  registeredAt: Date;
}

// Generate a royalty claim payload for a clinician
export function generateRoyaltyClaimPayload(params: {
  physicianId: string;
  caseIds: string[];
  amountSol: number;
  recipientAddress: string;
}) {
  return {
    type: 'ROYALTY_CLAIM',
    physician_id: params.physicianId,
    case_ids: params.caseIds,
    amount_sol: params.amountSol,
    recipient_address: params.recipientAddress,
    timestamp: new Date().toISOString(),
    platform: 'autocase-ai',
  };
}

export const SUPPORTED_CHAINS = {
  ETHEREUM_MAINNET: 1,
  BASE_MAINNET: 8453,       // Coinbase L2 - low fees for royalty micro-payments
  BASE_SEPOLIA: 84532,      // Base testnet
} as const;

// Base chain is preferred for Coinbase Smart Wallet royalty distributions
// due to low gas fees and native Coinbase integration
export const DEFAULT_CHAIN_ID = SUPPORTED_CHAINS.BASE_MAINNET;
