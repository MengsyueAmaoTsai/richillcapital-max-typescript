import MaxClient from "./client";
import { MaxCandle, MaxDepth, MaxMarketTrade, MaxOrderBook } from "./interfaces";
import { OrderBook, MarketTrade } from "./max-types";

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
    public getOrderBook = async (market: string, limit: number = 300, sortByPrice: boolean = false): Promise<MaxOrderBook> => {
        const parameters = {
            market: market.toLowerCase(),
            limit: limit,
            sort_by_price: sortByPrice
        }
        const orderBook = await this._sendPublicRequest<OrderBook>('GET', '/api/v2/depth', parameters);
        return {
            market: market.toUpperCase(),
            timestamp: orderBook.timestamp,
            lastUpdateId: orderBook.last_update_id,
            lastUpdateVersion: orderBook.last_update_version,
            bids: orderBook.bids.map(bid => {
                return {
                    price: bid[0],
                    size: bid[1]
                }
            }),
            asks: orderBook.asks.map(ask => {
                return {
                    price: ask[0],
                    size: ask[1]
                }  
            })
        }
    };

    /**
     * Get OHLC(k line) of a specific market
     * @param market 
     * @param period 
     * @param limit 
     * @returns 
     */
    public getKLines = async (market: string, period: number = 1, limit: number = 1000): Promise<MaxCandle[]> => {
        const parameters = {
            market: market.toLowerCase(),
            period: period,
            limit: limit,
        }
        const kLines = await this._sendPublicRequest<Array<number>[]>('GET', '/api/v2/k', parameters);
        return kLines.map(k => {
            return {
                market: market.toUpperCase(),
                timestamp: k[0],
                open: k[1],
                high: k[2],
                low: k[3],
                close: k[4],
                volume: k[5],
            }
        });
    };

    /**
     * Get recent trades on market, sorted in reverse creation order.
     * @param market 
     * @param limit 
     * @param orderBy 
     * @param pagenation 
     * @returns 
     */
    public getMarketTrades = async (market: string, limit: number = 1000, orderBy: string = 'desc', pagenation: boolean = false): Promise<MaxMarketTrade[]> => {
        const parameters = {
            market: market.toLowerCase(),
            limit: limit,
            orderBy: orderBy.toLowerCase(),
            pagenation: pagenation,
        }
        const marketTrades = await this._sendPublicRequest<MarketTrade[]>('GET', '/api/v2/trades', parameters);
        return marketTrades.map(mt => {
            return {
                id: mt.id,
                market: mt.market,
                marketName: mt.market_name,
                volume: Number(mt.volume),
                tradeVolume: Number(mt.funds),
                side: mt.side,
                createAt: mt.created_at,
                createAtMS: mt.created_at_in_ms,
                price: Number(mt.price),
            }
        });
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
