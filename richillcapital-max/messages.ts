

export interface MarketStatusMessage {
    market: string,
    status: 'active' | 'suspended' | 'cancel-only',   
    baseUnit: string,
    baseUnitPrecision: number,
    minBaseAmount: number,
    quoteUnit: string,
    quoteUnitPrecision: number,
    minQuoteAmount: number,
    mWalletSupported: boolean,
    gs: boolean
}