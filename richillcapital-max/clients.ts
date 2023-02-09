import { EventEmitter } from "events";
import qs from "qs";
import winston from "winston";
import { RawData, WebSocket } from "ws";
import * as crypto from 'crypto';


const REST_URL = 'https://max-api.maicoin.com';
const WEBSOCKET_URL = 'wss://max-stream.maicoin.com/ws';

const getLogger = (): winston.Logger => {
    return winston.createLogger({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(info => {
                return `${info.timestamp} - [${info.level.toUpperCase()}] - ${info.message}`;
            }),
        ),
        transports: [
            new winston.transports.Console(),
        ]
    });
}

export interface MaxMarketDataClient {
    on(event: 'websocketOpen', listener: () => void): this;
    on(event: 'websocketClose', listener: (code: number, reason: Buffer) => void): this;
    on(event: 'websocketError', listener: (error: Error) => void): this;

    on(event: 'marketStatusUpdate', listener: () => void): this;
    on(event: 'marketStatusSnapshot', listener: () => void): this;
    on(event: 'marketTradeUpdate', listener: () => void): this;
    on(event: 'marketTradeSnapshot', listener: () => void): this;
    on(event: 'tickerUpdate', listener: () => void): this;
    on(event: 'tickerSnapshot', listener: () => void): this;
    on(event: 'orderbookUpdate', listener: () => void): this;
    on(event: 'orderbookSnapshot', listener: () => void): this;
}

export interface MaxTradingClient {
    on(event: 'websocketOpen', listener: () => void): this;
    on(event: 'websocketClose', listener: (code: number, reason: Buffer) => void): this;
    on(event: 'websocketError', listener: (error: Error) => void): this;

    on(event: 'accountUpdate', listener: () => void): this;
    on(event: 'accountSnapshot', listener: () => void): this;
    on(event: 'orderUpdate', listener: () => void): this;
    on(event: 'orderSnapshot', listener: () => void): this;
    on(event: 'tradeUpdate', listener: () => void): this;
    on(event: 'tradeSnapshot', listener: () => void): this;
}


class MaxClient extends EventEmitter {

    protected logger: winston.Logger = getLogger();

    protected apiKey: string = '';
    protected secretKey: string = '';

    protected defaultHeaders = {
        'Content-Type': 'application/json',
        'User-Agent': `RichillCapital-TypeScript/`
    }

    protected websocketClient?: WebSocket;

    protected constructor(apiKey: string, secretKey: string) {
        super()
        this.apiKey = apiKey;
        this.secretKey = secretKey;
    }

    public getServerTime = async (): Promise<number> => await this.sendRequestPublic('GET', '/api/v2/timestamp');

    public getAllMarkets = async (): Promise<void> => {
        const json = await this.sendRequestPublic('GET', '/api/v2/markets');
    }

    public connectWebSocket = (): void => {
        this.logger.info(`Connecting to websocket ...`);
        this.websocketClient = new WebSocket(WEBSOCKET_URL)
            .on('open', this.onWebSocketOpened)
            .on('close', this.onWebSocketClosed)
            .on('error', this.onWebSocketError)
            .on('message', this.onWebSocketMessage);
    }

    protected sendMessage = (request: object) => {
        this.logger.info(`Send message to websocket => ${JSON.stringify(request)}`);
        this.websocketClient?.send(JSON.stringify(request));
    }
    
    protected onWebSocketOpened = (): void => {
        this.emit('websocketOpen');
    }

    protected onWebSocketClosed = (): void => {
        this.logger.info(`WebSocket closed.`);
    }

    protected onWebSocketError = (error: Error): void => {
        this.logger.info(`WebSocket error: ${error}.`);
    }

    protected onWebSocketMessage = (data: RawData): void => {
        this.logger.info(`WebSocket message: ${data.toString()}.`);
    }

    protected sendRequestPublic = async <T>(
        method: string, 
        endpoint: string, 
        parameters: {} = {}
    ): Promise<T> => await this.sendRequest<T>(method, endpoint, parameters);

    protected sendRequestPrivate = async <T>(
        method: string, 
        endpoint: string, 
        parameters: {} = {}
    ): Promise<T> => {
        if (!this.apiKey || !this.secretKey) return Promise.reject(new Error(`Missing API KEY or SECRET KEY`));
        return await this.sendRequest<T>(method, endpoint, this.buildAuthHeaders(endpoint, parameters));
    }   

    private sendRequest = async <T>(method: string, endpoint: string, paramters: {} = {}, headers?: {}): Promise<T> => {
        try {
            this.logger.info(`Send request => ${method} ${endpoint}`);
            const response = await fetch(
                this.buildUri(endpoint, paramters),
                {
                    method: method,
                    headers: headers ?? this.defaultHeaders
                }
            );
            return await response.json();

        } catch (error) {
            throw new Error(`Error on send request => ${endpoint} ${error}`);
        }
    };        

    private buildUri = (endpoint: string, queryParameters: {} = {}): string => {
        let uri = `${REST_URL}${endpoint}`;
        if (Object.keys(queryParameters).length > 0) {
            uri += `?${qs.stringify(queryParameters, { arrayFormat: 'brackets' })}`
        }
        return uri;
    };

    private buildAuthHeaders = (endpoint: string, parameters: {}) => {
        const parametersToSigned = Object.assign({}, parameters, { path: endpoint });
        const encodedPayload = this.encodeStringToBase64(JSON.stringify(parametersToSigned));
        return {
            ...this.defaultHeaders,
            'X-MAX-ACCESSKEY': this.apiKey,
            'X-MAX-PAYLOAD': encodedPayload,
            'X-MAX-SIGNATURE': this.generateRestSignature(encodedPayload)
        };        
    }

    private encodeStringToBase64 = (text: string): string => {
        return Buffer.from(text).toString('base64');
    };    

    private generateRestSignature = (encodedPayload: string) => {
        return crypto.createHmac('sha256', this.secretKey)
            .update(encodedPayload)
            .digest('hex');
    };
}


export class MaxMarketDataClient extends MaxClient {

    public constructor(apiKey: string, secretKey: string) {
        super(apiKey, secretKey)
    }

    public getMarketTrades = async (
        market: string, 
        limit: number = 1000, 
        orderBy: 'desc' | 'asc' = 'desc', 
        pagenation: boolean = false
    ) => {
        const parameters = {
            market: market.toLowerCase(),
            limit: limit,
            orderBy: orderBy.toLowerCase(),
            pagenation: pagenation
        };
        const json = await this.sendRequestPublic('GET', `/api/v2/trades`, parameters)
    }

    public getCandles = async (
        market: string,
        interval: number = 1,
        limit: number = 1000
    ) => {
        const parameters = {
            market: market.toLowerCase(),
            period: interval,
            limit: limit
        };
        const json = await this.sendRequestPublic('GET', `/api/v2/k`, parameters);
    }

    public getTicker = async (market: string) => {
        const json = await this.sendRequestPublic('GET', `/api/v2/tickers/${market.toLowerCase()}`);
    }

    public getMarketSummary = async () => {
        const json = await this.sendRequestPublic('GET', '/api/v2/summary');
    }

    public getOrderBook = async (
        market: string,
        limit: number = 1000,
        sortByPrice: boolean = false
    ) => {
        const parameters = {
            market: market.toLowerCase(),
            limit: limit,
            sort_by_price: sortByPrice
        };
        const json = await this.sendRequestPublic('GET', `/api/v2/depth`, parameters);
    }

    public subscribeMarketStatus = () => {
        const request = {
            id: 'richillcapital-max',
            action: 'sub',
            subscriptions: [
                {
                    channel: 'market_status',
                }
            ]
        };       
        this.sendMessage(request);
    }

    public unsubscribeMarketStatus = (): void => {
        const request = {
            id: 'richillcapital-max',
            action: 'unsub',
            subscriptions: [
                {
                    channel: 'market_status',
                }
            ]
        };        
        this.sendMessage(request);
    };

    public subscribeOrderBook = (market: string) => {
        const request = {
            id: 'richillcapital-max',
            action: 'sub',
            subscriptions: [
                {
                    channel: 'book',
                    market: market.toLowerCase(),
                }
            ]
        }
        this.sendMessage(request);
    }

    public unsubscribeOrderBook = (market: string) => {
        const request = {
            id: 'richillcapital-max',
            action: 'unsub',
            subscriptions: [
                {
                    channel: 'book',
                    market: market.toLowerCase(),
                }
            ]
        };
        this.sendMessage(request);
    };

    public subscribeMarketTrade = (market: string) => {
        const request = {
            id: 'richillcapital-max',
            action: 'sub',
            subscriptions: [
                {
                    channel: 'trade',
                    market: market.toLowerCase()
                }
            ]         
        }
        this.sendMessage(request);
    }

    public unsubscribeMarketTrade = (market: string) => {
        const request = {
            id: 'richillcapital-max',
            action: 'unsub',
            subscriptions: [
                {
                    channel: 'trade',
                    market: market.toLowerCase()
                }
            ]
        };
        this.sendMessage(request);
    };

    public subscribeTicker = (market: string) => {
        const request = {
            id: 'richillcapital-max',
            action: 'sub',
            subscriptions: [
                {
                    market: market.toLowerCase(),
                    channel: 'ticker',
                }
            ]
        }
        this.sendMessage(request);
    }

    public unsubscribeTicker = (market: string): void => {
        const request = {
            id: 'richillcapital-max',
            action: 'unsub',
            subscriptions: [
                {
                    market: market.toLowerCase(),
                    channel: 'ticker',
                }
            ]
        };           
        this.sendMessage(request);
    };    
}


export class MaxTradingClient extends MaxClient {
    
    public constructor(apiKey: string, secretKey: string) {
        super(apiKey, secretKey)
    }

    public getAllCurrencies = async () => {
        const json = await this.sendRequestPrivate('GET', '/api/v2/currencies');
    }

    public authenticate = (): void => {
        const nonce = Date.now();
        const request = {
            action: 'auth',
            apiKey: this.apiKey,
            nonce: nonce,
            signature: this.generateWebSocketSignature(nonce)
        };
        this.websocketClient?.send(JSON.stringify(request));        
    }

    public subscribeAccount = (): void => {
        const request = {
        }
    }

    public subscribeOrder = (): void => {
        const request = {

        }
    }

    public subscribeTrade = (): void => {
        const request = {

        }
    }

    private generateWebSocketSignature = (nonce: number) => 
        crypto.createHmac('sha256', this.secretKey)
            .update(nonce.toString())
            .digest('hex');
}




