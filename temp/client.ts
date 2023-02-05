import * as crypto from 'crypto';
import { EventEmitter } from "events";
import qs from "qs";
import WebSocket from "ws";


const REST_URL = 'https://max-api.maicoin.com';
const WEBSOCKET_URL = 'wss://max-stream.maicoin.com/ws';

interface MaxClient {
    getServerTime(): Promise<number>;
    getAllMarkets(): Promise<Array<object>>;
}


class MaxClient extends EventEmitter {
    
    protected defaultHeaders = {
        'Content-Type': 'application/json',
        'User-Agent': 'RichillCapital-Max-TypeScript'
    }

    protected websocketClient?: WebSocket;

    protected apiKey: string = '';
    protected secretKey: string = '';

    public constructor(apiKey: string, secretKey: string) {
        super()
        this.apiKey = apiKey;
        this.secretKey = secretKey;
    }

    public getServerTime = async (): Promise<number> => await this.sendPublicRequest<number>('GET', '/api/v2/timestamp');

    public getAllMarkets = async (): Promise<Array<object>> => {
        const markets = await this.sendPublicRequest<Array<object>>('GET', '/api/v2/markets');
        return markets.map(item => {
            return {
                id: item.id.toUpperCase(),
                name: item.name,
                status: item.market_status,
                baseUnit: item.base_unit,
                quoteUnit: item.quote_unit,
                baseUnitPrecision: item.base_unit_precision,
                quoteUnitPrecision: item.quote_unit_precision,
                minBaseAmount: item.min_base_amount,
                minQuoteAmount: item.min_quote_amount,
                mWalletSupported: item.m_wallet_supported
            }
        });
    }

    protected sendPublicRequest = async <T>(method: string, endpoint: string, paramters: {} = {}): Promise<T> => await this.sendRequest<T>(method, endpoint, paramters);

    protected sendPrivateRequest = async <T>(method: string, endpoint: string, paramters: {} = {}): Promise<T> => {
        if (!this.apiKey || !this.secretKey) 
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        return await this.sendRequest<T>(method, endpoint, paramters, this.buildAuthHeaders(endpoint, paramters));
    };

    private sendRequest = async <T>(method: string, endpoint: string, paramters: {} = {}, headers?: {}): Promise<T> => {
        try {
            console.log(`Send request => ${method} ${endpoint}`);
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
    };
    
    private encodeStringToBase64 = (text: string): string => Buffer.from(text).toString('base64');

    private generateRestSignature = (encodedPayload: string) => crypto.createHmac('sha256', this.secretKey).update(encodedPayload).digest('hex');    
}


export default MaxClient;