export interface MaxProfile {
  userId: string;
  name: string;
  email: string;
  language: string;
  countryCode: string;
  phoneNumber: string;
  status: string;
  profileVerified: boolean;
  kycState: string;
  anyKycRejected: boolean;
  agreementChecked: boolean;
  level: number;
  vipLevel: number;
  memberType: string;
  supplementalDocumentType: string;
  avatarUrl: string | null;
  avatarNftOwnershipSerialNumber: string | null;    
};

export interface MaxVipLevel {
    level: number;
    minTradingVolume: number;
    minStakingVolume: number;
    makerFee: number;
    takerFee: number;
}

export interface MaxBalance {
    currencyId: string;
    balance: number;
    locked: number;
    stacked: number;
    type: string;
}

export interface MaxMarket {
    id: string;
    name: string;
    marketStatus: string; 
    baseUnit: string; 
    baseUnit_precision: number;
    minBaseAmount: number;
    quoteUnit: string;
    quoteUnit_precision: number;
    minQuoteAmount: number;
    mWalletSupported: boolean;
};
