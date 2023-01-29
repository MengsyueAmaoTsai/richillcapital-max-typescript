import MaxClient from "./client";

interface MaxMarketDataClient {

};

class MaxMarketDataClient extends MaxClient {
    
    public constructor(apiKey: string, secretKey: string) {
        super(apiKey, secretKey)
    }
    
    /**
     * Get depth of a specified market.
     * @param market 
     * @param limit 
     * @param sortByPrice 
     */
    public getOrderBook = async (market: string, limit: number = 300, sortByPrice: boolean = false): Promise<void> => {
        const parameters = {
            market: market.toLowerCase(),
            limit: limit,
            sort_by_price: sortByPrice
        }
        const orderBook = await this._sendPublicRequest('GET', '/api/v2/depth', parameters);
        console.log(orderBook);
    };

    public getKLines = async (market: string, period: number = 1, limit: number = 100, timestamp?: number): Promise<void> => {
        const parameters = {
            market: market.toLowerCase(),
            period: period,
            limit: limit,
        }
        const kLines = await this._sendPublicRequest('GET', '/api/v2/k', parameters);
        console.log(kLines);
    };

    public getMarketTrades = async (market: string, limit: number = 1000, orderBy: string = 'desc', pagenation: boolean = false) => {
        const parameters = {
            market: market.toLowerCase(),
            limit: limit,
            orderBy: orderBy.toLowerCase(),
            pagenation: pagenation,
        }
        const marketTrades = await this._sendPublicRequest('GET', '/api/v2/trades', parameters);
        console.log(marketTrades);
    };

    public getSummary = async (): Promise<void> => {
        const summary = await this._sendPublicRequest('GET', `/api/v2/summary`);
        console.log(summary);
    };

    /**
     * Get ticker of specific market
     * @param market 
     * @returns 
     */
    public getTickers = async (market: string): Promise<void> => {
        const tickers = await this._sendPublicRequest('GET', `/api/v2/tickers/${market}`);
        console.log(tickers);        
    };    
    //#region WebSocket APIs
    
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
        this._websocketClient?.send(JSON.stringify(data));

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
        this._websocketClient?.send(JSON.stringify(data));
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
        this._websocketClient?.send(JSON.stringify(data));
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
        this._websocketClient?.send(JSON.stringify(data));
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
        this._websocketClient?.send(JSON.stringify(data));
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
        this._websocketClient?.send(JSON.stringify(data));
    };    

    //#endregion
}


export default MaxMarketDataClient;
