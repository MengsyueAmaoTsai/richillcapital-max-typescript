import { createHmac } from "crypto";
import * as crypto from 'crypto';
import EventEmitter from "events";
import * as qs from 'qs';
import WebSocket, { RawData } from "ws";

const REST_URL = 'https://max-api.maicoin.com';
const WEBSOCKET_URL = 'wss://max-stream.maicoin.com/ws';

abstract class MaxClient extends EventEmitter {
    
    protected _websocketClient?: WebSocket;
    protected _defaultHeaders = {
        'Content-Type': 'application/json'
    }

    protected _apiKey: string = '';
    protected _secretKey: string = '';

    public constructor() {
        super()
    }
    
    public connectWebSocket = (apiKey: string, secretKey: string) => {
        console.log(`Connecting to MAX exchange. API_KEY: ${apiKey} SECRET_KET: ${secretKey}`);
        this._apiKey = apiKey;
        this._secretKey = secretKey;
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
    public getServerTime = async (): Promise<number> => {
        const endpoint = '/api/v2/timestamp';

        const uri = this._buildUri(endpoint);
        console.log(`Request Uri: ${uri}`);

        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._defaultHeaders
            });
            return await response.json() as number;
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return 0;
        }   
    };

    /**
     * Get all available markets.
     * @returns 
     */
    public getMarkets = async (): Promise<void> => {
        const endpoint = '/api/v2/markets';

        const uri = this._buildUri(endpoint);
        console.log(`Request Uri: ${uri}`);

        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._defaultHeaders
            });
            const data = await response.json();
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
        }
    };

    /**
     * Get all available currencies.
     * @returns 
     */
    public getCurrencies = async (): Promise<void> => 
        await this._sendPublicRequest('GET', '/api/v2/currencies');

    protected _sendPublicRequest = async <T>(method: string, endpoint: string, parameters: {} = {}): Promise<T> => 
        await this.__sendRequest<T>(method, endpoint, this._defaultHeaders, parameters);

    protected _sendPrivateRequest = async <T>(method: string, endpoint: string, parameters: {} = {}): Promise<T> => 
        await this.__sendRequest<T>(method, endpoint, this._generateAuthHeaders(endpoint, parameters), parameters);

    private __sendRequest = async <T>(method: string, endpoint: string, headers: {} = {}, parameters: {} = {}): Promise<T> => {
        const uri = this._buildUri(endpoint, parameters);
        console.info(`Send request => ${method} ${uri}`);
        
        try {
            const response = await fetch(
                uri,
                {
                    method: method,
                    headers: headers
                }
            );
            return await response.json() as T;
        } catch (error) {
            throw new Error(`Error when send request to MAX exchange => ${uri} ${error}`);
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