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

export interface MaxTrade {
    id: number,
    price: number,
    quantity: number,
    tradeVolume: number,
    market: string,
    marketName: string,
    createdAt: number,
    createdAtMS: number,
    side: string, // ask / bid
    fee: number,
    feeCurrency: string, // twd
    orderId: number,
    // info: { 
    //     maker: string, 
    //     ask: Fee | null, 
    //     bid: Fee | null 
    // }    
};

export interface MaxOrder {
    id: string,
    clientOrderId: string,
}

export interface MaxCandle {
    market: string,
    timestamp: number,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number
}

export interface MaxMarketTrade {
    id: number,
    market: string,
    marketName: string
    price: number,
    volume: number,
    tradeVolume: number,
    createAt: number,
    createAtMS: number,
    side: string,
}

export interface MaxDepth {
    price: number,
    size: number
};

export interface MaxOrderBook {
    market: string,
    timestamp: number,
    lastUpdateVersion: number,
    lastUpdateId: number,
    asks: MaxDepth[],
    bids: MaxDepth[]
}

export interface MaxTicker {
    market: string,
    timestamp: number,
    bid: number,
    ask: number,
    last: number,
    open: number,
    high: number,
    low: number,
    volume: number,
    volumeInBtc: number
}

export interface MaxCurrency {
    id: string,
    precision: number,
    sygnaSupported: boolean,
    mWalletSupported: boolean,
    minBorrowAmount: number
}

export interface MaxCoin {
    id: string,
    name: string,
    withdraw: 'ON' | 'OFF';
    deposit: 'ON' | 'OFF';
    trade: 'ON' | 'OFF';
}

export interface MaxMarketSummary {
    tickers: MaxTicker[],
    coins: MaxCoin[]
}

