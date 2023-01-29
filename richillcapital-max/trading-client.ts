import * as crypto from 'crypto';

import MaxClient from "./client";


interface MaxTradingClient {
    authenticate: () => void;
};

class MaxTradingClient extends MaxClient {

    public constructor(apiKey: string, secretKey: string) {
        super(apiKey, secretKey)
    }

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

        const uri = this._buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._generateAuthHeaders(endpoint, parameters)
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

        const uri = this._buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._generateAuthHeaders(endpoint, parameters)
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

        const uri = this._buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._generateAuthHeaders(endpoint, parameters)
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

        const uri = this._buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._generateAuthHeaders(endpoint, parameters)
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

        const uri = this._buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._generateAuthHeaders(endpoint, parameters)
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

        const uri = this._buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }               
    };    

    /**
     * Send authentication message to server.
     */
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

    /**
     * Generate signature string for websocket authentication.
     * @param nonce 
     * @returns 
     */
    private __generateWebSocketSignature = (nonce: number): string => 
        crypto.createHmac('sha256', this._secretKey).update(nonce.toString()).digest('hex');
};

export default MaxTradingClient;
