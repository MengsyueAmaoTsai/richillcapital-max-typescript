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

    protected connectWebSocket = (): void => {
        this.websocketClient = new WebSocket(WEBSOCKET_URL)
            .on('open', this.onWebSocketOpened)
            .on('close', this.onWebSocketClosed)
            .on('error', this.onWebSocketError)
            .on('message', this.onWebSocketClosed);
    }
    
    protected onWebSocketOpened = (): void => {
        this.logger.info(`WebSocket opened.`)
    }

    protected onWebSocketClosed = (code: number, reason: Buffer): void => {
        this.logger.info(`WebSocket closed. code: ${code} reason: ${reason}`);
    }

    protected onWebSocketError = (error: Error): void => {
        this.logger.info(`WebSocket error: ${error}.`);
    }

    protected onWebSocketMessage = (data: RawData): void => {
        this.logger.info(`WebSocket message: ${JSON.parse(data.toString())}.`);
    }

    protected sendRequestPublic = async <T>(
        method: string, 
        endpoint: string, 
        parameters: {} = {}
    ): Promise<T> => await this.sendRequest<T>(method, endpoint, parameters);
    
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
            action: 'sub',
            channel: 'market_status'
        };
    }

    public subscribeOrderBook = (market: string) => {
        const request = {
            action: 'sub',
            channel: 'book',
            market: market.toLowerCase()
        }
    }

    public subscribeMarketTrade = (market: string) => {
        const request = {
            action: 'sub',
            channel: 'trade',
            market: market.toLowerCase()            
        }
    }

    public subscribeTicker = (market: string) => {
        const request = {
            action: 'sub',
            channel: 'ticker',
            market: market.toLowerCase()
        }
    }
}


export class MaxTradingClient extends MaxClient {
    
    public constructor(apiKey: string, secretKey: string) {
        super(apiKey, secretKey)
    }

    public authenticate = (): void => {
        const nonce = Date.now();
        const request = {
            action: 'auth',
            apiKey: this.apiKey,
            nonce: nonce,
            signature: this.generateWebSocketSignature(nonce)
        };
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
        crypto.createHmac('sha256', this.secretKey).update(nonce.toString()).digest('hex');
}




