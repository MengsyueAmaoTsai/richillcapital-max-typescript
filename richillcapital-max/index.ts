import { createHmac } from "crypto";
import * as qs from 'qs';
import { 
    MaxMarket, 
    MaxCurrency, 
    MaxTicker
} from './max-type';

const REST_URL = 'https://max-api.maicoin.com';
const WEBSOCKET_URL = 'wss://max-stream.maicoin.com/ws';

interface Market {
    id: string;
    name: string;
    marketStatus: string;
    baseUnit: string;
    baseUnitPrecision: number;
    minBaseAmount: number;
    quoteUnit: string;
    quoteUnitPrecision: number;
    minQuoteAmount: number;
    mWalletSupported: boolean;
}

interface Currency {
    id: string,
    precision: number,
    sygnaSupported: boolean,
    mWalletSupported: boolean,
    minBorrowAmount: string
}

interface Ticker {
    market: string,
    timestamp: number,
    last: number,
    bid: number,
    ask: number,
    open: number,
    low: number,
    high: number,
    volume: number,
    volumeInBtc: number,
}

class MaxClient {
    private __defaultHeaders = {
        'Content-Type': 'application/json'
    }

    constructor() {

    }

    public getMarkets = async (): Promise<Market[]> => {
        const endpoint = '/api/v2/markets';

        const uri = this.__buildUri(endpoint);
        console.log(`Request Uri: ${uri}`);

        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__defaultHeaders
            });
            const data = await response.json();
            const markets: Market[] = data.map((market: MaxMarket) => {
                return {
                    id: market.id,
                    name: market.name,
                    marketStatus: market.market_status,
                    baseUnit: market.base_unit,
                    baseUnitPrecision: market.base_unit_precision,
                    minBaseAmount: market.min_base_amount,
                    quoteUnit: market.quote_unit,
                    quoteUnitPrecision: market.quote_unit_precision,
                    minQuoteAmount: market.min_quote_amount,
                    mWalletSupported: market.m_wallet_supported,
                }
            })
            return markets;
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return [] as Market[];
        }
    };

    public getCurrencies = async (): Promise<Currency[]> => {
        const endpoint = '/api/v2/currencies';

        const uri = this.__buildUri(endpoint);
        console.log(`Request Uri: ${uri}`);

        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__defaultHeaders
            });
            const data: MaxCurrency[] = await response.json();
            return data.map(item => {
                return {
                    id: item.id,
                    precision: item.precision,
                    sygnaSupported: item.sygna_supported,
                    mWalletSupported: item.m_wallet_supported,
                    minBorrowAmount: item.min_borrow_amount
                }
            });
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return [] as Currency[];
        }        
    };

    public getTickers = async (market: string): Promise<Ticker> => {
        const endpoint = `/api/v2/tickers/${market}`;

        const uri = this.__buildUri(endpoint);
        console.log(`Request Uri: ${uri}`);

        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__defaultHeaders
            });
            const data: MaxTicker = await response.json();
            return {
                market: market,
                timestamp: data.at,
                last: Number(data.last),
                bid: Number(data.buy),
                ask: Number(data.sell),
                open: Number(data.open),
                low: Number(data.low),
                high: Number(data.high),
                volume: Number(data.vol),
                volumeInBtc: Number(data.vol_in_btc),
            };                    
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return {} as Ticker;
        }   
    };
    
    public getServerTime = async (): Promise<number> => {
        const endpoint = '/api/v2/timestamp';

        const uri = this.__buildUri(endpoint);
        console.log(`Request Uri: ${uri}`);

        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__defaultHeaders
            });
            return await response.json() as number;
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return 0;
        }   
    };

    private __buildUri = (endpoint: string, queryParameters: {} = {}): string => {
        let uri = `${REST_URL}${endpoint}`;

        if (Object.keys(queryParameters).length > 0) {
            uri += `?${qs.stringify(queryParameters, { arrayFormat: 'brackets' })}`
        }
        return uri;
    };
}

export default MaxClient;