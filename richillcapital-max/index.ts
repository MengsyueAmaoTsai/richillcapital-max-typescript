import { createHmac } from "crypto";
import * as crypto from 'crypto';
import EventEmitter from "events";

import * as qs from 'qs';
import WebSocket, { RawData } from "ws";

import { 
    MaxMarket, 
    MaxCurrency, 
    MaxTicker,
    MaxMe,
    MaxAccount,
    MaxDepositDetails
} from './max-type';


const REST_URL = 'https://max-api.maicoin.com';
const WEBSOCKET_URL = 'wss://max-stream.maicoin.com/ws';

enum MarketStatus {
    Suspended = "suspended",
    CancelOnly = "cancel-only",
    Active = "active"
}

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

class MaxClient extends EventEmitter {

    private _websocketClient?: WebSocket;
    private __defaultHeaders = {
        'Content-Type': 'application/json'
    }

    private _apiKey: string = '';
    private _secretKey: string = '';

    public constructor() {
        super()
    }

    public connect = (apiKey: string, secretKey: string) => {
        console.log(`Connecting to MAX exchange. API_KEY: ${apiKey} SECRET_KET: ${secretKey}`);
        this._apiKey = apiKey;
        this._secretKey = secretKey;
        this._websocketClient = new WebSocket(WEBSOCKET_URL);
        this._websocketClient.on('open', this.__onWebSocketOpen.bind(this))
        this._websocketClient.on('close', this.__onWebSocketClose.bind(this))
        this._websocketClient.on('error', this.__onWebSocketError.bind(this))
        this._websocketClient.on('message', this.__onWebSocketMessage.bind(this))        
    };

    /**
     * Get all available markets.
     * @returns 
     */
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

    /**
     * Get all available currencies.
     * @returns 
     */
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

    /**
     * Get ticker of specific market
     * @param market 
     * @returns 
     */
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
    
    /**
     * Get server current time, in seconds since Unix epoch
     * @returns  
     */
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

    /**
     * Get user profile and account information.
     * @returns 
     */
    public getMe = async () => {
        const endpoint = '/api/v2/members/me';
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now()
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data: MaxMe = await response.json();
            console.log(data.locked_status_of_2fa);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }   
    };

    public getProfile = async () => {
        const endpoint = '/api/v2/members/profile';
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now()
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }           
    };

    /**
     * Get personal accounts information
     * @returns 
     */
    public getAccounts = async () => {
        const endpoint = '/api/v2/members/accounts';
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now()
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data: MaxAccount[] = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }     
    };

    /**
     * Get personal accounts information of a currency
     * @param currency 
     * @returns 
     */
    public getAccount = async (currency: string) => {
        const endpoint = `/api/v2/members/accounts/${currency}`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now()
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data: MaxAccount = await response.json();
            return {
                currency: data.currency,
                balance: data.balance,
                locked: data.locked,
                accountType: data.type,
                staked: data.staked
            }
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }     
    };

    public getDepositHistory = async (currency: string, limit: number = 1000) => {
        const endpoint = `/api/v2/deposits`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            currency: currency,
            limit: limit
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data: MaxDepositDetails[] = await response.json();
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }          
    };

    /**
     * Get details of a specific deposit
     * @param transactionId 
     * @returns 
     */
    public getDepositDetail = async (transactionId: string) => {
        const endpoint = `/api/v2/deposit`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            txid: transactionId
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data: MaxDepositDetails = await response.json();
            return {
                transactionId: data.txid,
                depositId: data.uuid,
                currency: data.currency,
                amount: Number(data.amount),
                fee: Number(data.fee),
                confirmations: data.confirmations,
                state: data.state,
                status: data.status,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            }
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }          
    };

    /**
     * The addresses could be empty before generated, please call POST /deposit_addresses in that case
     * @param currencyId 
     * @returns 
     */
    public getDepositAddresses = async (currencyId: string) => {
        const endpoint = `/api/v2/deposit_addresses`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            currency: currencyId
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }     
    };

    /**
     * Address creation is asynchronous, please call GET /deposit_addresses later to get generated addresses
     * @param currencyId 
     * @returns 
     */
    public createDepositAddresses = async (currencyId: string) => {
        const endpoint = `/api/v2/deposit_addresses`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            currency: currencyId
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'POST',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }     
    };    

    public getWithdrawalHistory = async (currencyId: string, limit: number = 1000) => {
        const endpoint = '/api/v2/withdrawals';
    };

    /**
     * Get details of a specific external withdraw
     * @param withdrawId 
     */
    public getWithdrawalDetails = async (withdrawId: string) => {
        const endpoint = '/api/v2/withdrawal';
    };

    public withdraw = async (currencyId: string) => {
        const endpoint = '/api/v2/withdrawal';
    };

    public getOrders = async (market: string, state: string = 'done', limit: number = 1000) => {
        const endpoint = `/api/v2/orders`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            market: market,
            state: state,
            limit: limit,
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }               
    };

    public getOrder = async (orderId: number) => {
        const endpoint = `/api/v2/order`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            id: orderId,
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }               
    };

    public getTrades = async (market: string, limit: number = 1000) => {
        const endpoint = `/api/v2/trades/my`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            market: market,
            limit: limit,
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }               
    };

    public getTradesByOrderId = async (orderId: number, clientOrderId: string) => {
        const endpoint = `/api/v2/trades/my/of_order`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            id: orderId,
            client_oid: clientOrderId,
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }               
    };

    public placeOrder = async (market: string, side: string, orderType: string) => {
        const endpoint = `/api/v2/orders`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            market: market,
            side: side,
            ord_type: orderType,
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }               
    };

    public cancelOrder = async (market: string, side: string) => {
        const endpoint = '/api/v2/orders/clear';
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            market: market,
            side: side
        }

        const uri = this.__buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this.__generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }               
    };    
    //#region Helpers
    private __buildUri = (endpoint: string, queryParameters: {} = {}): string => {
        let uri = `${REST_URL}${endpoint}`;
        if (Object.keys(queryParameters).length > 0) {
            uri += `?${qs.stringify(queryParameters, { arrayFormat: 'brackets' })}`
        }
        return uri;
    };

    private __encodeStringToBase64 = (text: string): string => {
        return Buffer.from(text).toString('base64');
    };

    private __generateRestSignature = (encodedPayload: string) => {
        return crypto.createHmac('sha256', this._secretKey).update(encodedPayload).digest('hex');
    };

    private __generateWebSocketSignature = (nonce: number): string => {
        return crypto.createHmac('sha256', this._secretKey).update(nonce.toString()).digest('hex');
    };
    
    private __generateAuthHeaders = (endpoint: string, parameters: {}) => {
        const parametersToSigned = Object.assign({}, parameters, { path: endpoint });
        const encodedPayload = this.__encodeStringToBase64(JSON.stringify(parametersToSigned));
        return {
            ...this.__defaultHeaders,
            'X-MAX-ACCESSKEY': this._apiKey,
            'X-MAX-PAYLOAD': encodedPayload,
            'X-MAX-SIGNATURE': this.__generateRestSignature(encodedPayload)
        };
    };



    //#endregion

    //#region WebSocket event handlers
    private __onWebSocketOpen = () => {
        console.log('Websocket opened');
    };

    private __onWebSocketClose = (code: number, reason: Buffer) => {
        console.log(`Websocket closed => Code: ${code} Reason: ${reason}`);
    };

    private __onWebSocketError = (error: Error) => {
        console.log(`Websocket error: ${error}`);
    }

    private __onWebSocketMessage = (data: RawData, isBinary: boolean) => {
        console.log(`Websocket Message => RawData: ${data} isBinary: ${isBinary}`);
    };

    //#endregion

    public subscribeMarketTrade = (market: string) => {
        const data = {
            id: 'richillcapital-max',
            action: 'sub',
            subscriptions: [
                {
                    channel: 'trade',
                    market: market
                }
            ]
        };
        this._websocketClient?.send(JSON.stringify(data));
    };
    public unsubscribeMarketTrade = (market: string) => {
        const data = {
            id: 'richillcapital-max',
            action: 'unsub',
            subscriptions: [
                {
                    channel: 'trade',
                    market: market
                }
            ]
        };
        this._websocketClient?.send(JSON.stringify(data));
    };

    public subscribeOrderBook = (market: string, depth: number = 10) => {
        const data = {
            id: 'richillcapital-max',
            action: 'sub',
            subscriptions: [
                {
                    channel: 'book',
                    market: market,
                    depth: depth
                }
            ]
        };
    };

    public unsubscribeOrderBook = (market: string) => {
        const data = {
            id: 'richillcapital-max',
            action: 'unsub',
            subscriptions: [
                {
                    channel: 'book',
                    market: market,
                }
            ]
        };
    };

    public subscribeMarketStatus = (): void => {
        const data = {
            id: 'richillcapital-max',
            action: 'sub',
            subscriptions: [
                {
                    channel: 'market_status',
                }
            ]
        };        
    };

    public unsubscribeMarketStatus = (): void => {
        const data = {
            id: 'richillcapital-max',
            action: 'unsub',
            subscriptions: [
                {
                    channel: 'market_status',
                }
            ]
        };        
    };

    public subscribeTicker = (market: string): void => {
        const data = {
            id: 'richillcapital-max',
            action: 'sub',
            subscriptions: [
                {
                    market: market,
                    channel: 'ticker',
                }
            ]
        };                
    };

    public unsubscribeTicker = (market: string): void => {
        const data = {
            id: 'richillcapital-max',
            action: 'unsub',
            subscriptions: [
                {
                    market: market,
                    channel: 'ticker',
                }
            ]
        };           
    };
    
    public subscribeAccount = (): void => {
    };

    public unsubscribeAccount = (): void => {
    };

    public subscribeOrder = (): void => {
    };

    public unsubscribeOrder = (): void => {
    };

    public subscribeTrade = (): void => {
    };

    public unsubscribeTrade = (): void => {

    };

    public authenticate = (): void => {
        const nonce = Date.now()
        const data = {
            action: 'auth',
            apiKey: this._apiKey,
            nonce: nonce,
            signature: this.__generateWebSocketSignature(nonce),
        };
        this._websocketClient?.send(JSON.stringify(data));        
    };

}

export default MaxClient;