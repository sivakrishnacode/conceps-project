export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionCategory {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  WINNING = 'WINNING',
  PARTICIPATION = 'PARTICIPATION',
  BONUS = 'BONUS',
}

export enum KycStatus {
  PENDING = 'PENDING',
  OTP_SENT = 'OTP_SENT',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  mobile: string;
  name?: string | null;
  isVerified: boolean;
  isAgeCertified: boolean;
  createdAt: Date;
  updatedAt: Date;
  wallet?: Wallet | null;
  kyc?: KycVerification | null;
}

export interface Wallet {
  id: string;
  userId: string;
  depositBalance: number;
  winningsBalance: number;
  createdAt: Date;
  updatedAt: Date;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  referenceId?: string | null;
  description?: string | null;
  createdAt: Date;
}

export interface KycVerification {
  id: string;
  userId: string;
  aadhaarNumber?: string | null;
  otpTxnId?: string | null;
  aadhaarRefId?: string | null;
  verifiedName?: string | null;
  verifiedDob?: string | null;
  verifiedGender?: string | null;
  verifiedAddress?: string | null;
  status: KycStatus;
  documentUrl?: string | null;
  verifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  maxBonus: number;
  minDeposit: number;
  usageLimit: number;
  usedCount: number;
  validUntil: Date;
  createdAt: Date;
}
