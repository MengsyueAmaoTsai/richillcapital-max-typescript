import { RawData } from "ws";
import MaxClient from "./client";
import { MaxCandle, MaxDepth, MaxMarketSummary, MaxMarketTrade, MaxOrderBook, MaxTicker } from "./interfaces";
import { OrderBook, MarketTrade, Ticker, MarketSummary } from "./max-types";

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
                    price: Number(bid[0]),
                    size: Number(bid[1])
                }
            }),
            asks: orderBook.asks.map(ask => {
                return {
                    price: Number(ask[0]),
                    size: Number(ask[1])
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

    /**
     * Overview of market data for all tickers
     * @returns 
     */
    public getSummary = async (): Promise<MaxMarketSummary> => {
        const summary = await this._sendPublicRequest<MarketSummary>('GET', `/api/v2/summary`);
        return {
            coins: Object.keys(summary.coins).map(key => {
                const coin = summary.coins[key]
                return {
                    id: key.toUpperCase(),
                    name: coin.name,
                    withdraw: coin.withdraw,
                    deposit: coin.deposit,
                    trade: coin.trade
                }
            }),
            tickers: Object.keys(summary.tickers).map(key => {
                const ticker = summary.tickers[key]
                return {
                    market: key.toUpperCase(),
                    timestamp: ticker.at,
                    bid: Number(ticker.buy),
                    ask: Number(ticker.sell),
                    last: Number(ticker.last),
                    open: Number(ticker.open),
                    high: Number(ticker.high),
                    low: Number(ticker.low),
                    volume: Number(ticker.vol ?? '0'),
                    volumeInBtc: Number(ticker.vol_in_btc ?? '0')
                }
            })
        }
    };

    /**
     * Get ticker of specific market.
     * @param market 
     * @returns 
     */
    public getTicker = async (market: string): Promise<MaxTicker> => {
        const ticker = await this._sendPublicRequest<Ticker>('GET', `/api/v2/tickers/${market.toLowerCase()}`);
        return {
            market: market.toUpperCase(),
            timestamp: ticker.at,
            bid: Number(ticker.buy),
            ask: Number(ticker.sell),
            last: Number(ticker.last),
            open: Number(ticker.open),
            high: Number(ticker.high),
            low: Number(ticker.low),
            volume: Number(ticker.vol),
            volumeInBtc: Number(ticker.vol_in_btc),

        }
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
        console.log(`Subscribe => ${data}`);
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

    protected _onWebSocketMessage(data: RawData): void {
        const obj = JSON.parse(data.toString());
        const { e: eventType } = obj;

        switch (eventType) {
            case 'error':
                break;
            case 'subscribed':
                break;
            case 'unsubscribed':
                break;
            case 'snapshot':
                break;
            case 'update':
                break;
        }
    }
}


export default MaxMarketDataClient;
