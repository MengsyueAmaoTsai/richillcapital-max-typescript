
export type MaxMarket = {
    id: string;
    name: string;
    market_status: string;
    base_unit: string;
    base_unit_precision: number;
    min_base_amount: number;
    quote_unit: string;
    quote_unit_precision: number;
    min_quote_amount: number;
    m_wallet_supported: boolean;
}

export type MaxCurrency = {
    id: string,
    precision: number,
    sygna_supported: boolean,
    m_wallet_supported: boolean,
    min_borrow_amount: string
}

export type MaxTicker = {
    at: number,
    buy: number,
    sell: number,
    open: number,
    low: number,
    high: number,
    last: number,
    vol: number,
    vol_in_btc: number,
}