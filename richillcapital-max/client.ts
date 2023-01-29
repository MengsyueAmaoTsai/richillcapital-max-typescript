import * as crypto from 'crypto';
import EventEmitter from "events";
import * as qs from 'qs';
import WebSocket, { RawData } from "ws";
import { MaxMarket } from './interfaces';
import { Market } from './max-types';


const REST_URL = 'https://max-api.maicoin.com';
const WEBSOCKET_URL = 'wss://max-stream.maicoin.com/ws';

abstract class MaxClient extends EventEmitter {
    
    protected _websocketClient?: WebSocket;
    protected _defaultHeaders = {
        'Content-Type': 'application/json',
        'User-Agent': `RichillCapital-TypeScript/`
    }

    protected _apiKey: string = '';
    protected _secretKey: string = '';

    public constructor(apiKey: string, secretKey: string) {
        super()
        this._apiKey = apiKey;
        this._secretKey = secretKey;
    }
    
    public connectWebSocket = () => {

        this._websocketClient = new WebSocket(WEBSOCKET_URL)
            .on('open', this.__onWebSocketOpen.bind(this))
            .on('close', this.__onWebSocketClose.bind(this))
            .on('error', this.__onWebSocketError.bind(this))
            .on('message', this.__onWebSocketMessage.bind(this));
    };

   /**
     * Get server current time, in seconds since Unix epoch
     * @returns  
     */
    public getServerTime = async (): Promise<number> => await this._sendPublicRequest<number>('GET', '/api/v2/timestamp');

    /**
     * Get all available markets.
     * @returns 
     */
    public getMarkets = async (): Promise<MaxMarket[]> => {
        const markets = await this._sendPublicRequest<Market[]>('GET', '/api/v2/markets');
        return markets.map(item => {
            return {
                id: item.id.toUpperCase(),
                name: item.name,
                marketStatus: item.market_status, 
                baseUnit: item.base_unit, 
                baseUnit_precision: item.base_unit_precision,
                minBaseAmount: item.min_base_amount,
                quoteUnit: item.quote_unit,
                quoteUnit_precision: item.quote_unit_precision,
                minQuoteAmount: item.min_quote_amount,
                mWalletSupported: item.m_wallet_supported
            }
        });
    };

    protected _sendPublicRequest = async <T>(method: string, endpoint: string, paramters: {} = {}): Promise<T> => {
        return await this.__sendRequest<T>(method, endpoint, paramters);
    };

    protected _sendPrivateRequest = async <T>(method: string, endpoint: string, paramters: {} = {}): Promise<T> => {
        if (!this._apiKey || !this._secretKey) 
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        return await this.__sendRequest<T>(method, endpoint, paramters, this._generateAuthHeaders(endpoint, paramters));
    };

    private __sendRequest = async <T>(method: string, endpoint: string, paramters: {} = {}, headers?: {}): Promise<T> => {
        try {
            console.log(`Send request => ${method} ${endpoint}`);
            const response = await fetch(
                this._buildUri(endpoint, paramters),
                {
                    method: method,
                    headers: headers ?? this._defaultHeaders
                }
            );
            return await response.json();

        } catch (error) {
            throw new Error(`Error on send request => ${endpoint} ${error}`);
        }
    };

    protected _buildUri = (endpoint: string, queryParameters: {} = {}): string => {
        let uri = `${REST_URL}${endpoint}`;
        if (Object.keys(queryParameters).length > 0) {
            uri += `?${qs.stringify(queryParameters, { arrayFormat: 'brackets' })}`
        }
        return uri;
    };

    protected _generateAuthHeaders = (endpoint: string, parameters: {}) => {
        const parametersToSigned = Object.assign({}, parameters, { path: endpoint });
        const encodedPayload = this.__encodeStringToBase64(JSON.stringify(parametersToSigned));
        return {
            ...this._defaultHeaders,
            'X-MAX-ACCESSKEY': this._apiKey,
            'X-MAX-PAYLOAD': encodedPayload,
            'X-MAX-SIGNATURE': this.__generateRestSignature(encodedPayload)
        };
    };

    private __encodeStringToBase64 = (text: string): string => {
        return Buffer.from(text).toString('base64');
    };

    private __generateRestSignature = (encodedPayload: string) => {
        return crypto.createHmac('sha256', this._secretKey).update(encodedPayload).digest('hex');
    };

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
}

export default MaxClient;