import MaxMarketDataClient from "../richillcapital-max/market-data-client";
import * as dotenv from 'dotenv';
import { EventEmitter } from "stream";

dotenv.config();

interface ConnectionOptions {
    apikey: string;
    secretKey: string
}

interface MaxDataFeed {

}

interface Tick {
    symbol: string;
    timestamp: number;
    last: number;
    size: number;
}

interface OrderBook {
    symbol: string;
    timestamp: number;
    bids: Array<Array<number>>;
    asks: Array<Array<number>>;
}

interface Instrument {
    symbol: string;
    description: string;
    exchange: string;
}

class MaxDataFeed extends EventEmitter {

    private __client?: MaxMarketDataClient;
    private __connectionOptions?: ConnectionOptions;
    private __connectTime?: number;
    private __instruments?: Array<Instrument>;

    constructor() {
        super()
    }
    
    public isConnected: boolean = false;

    public connect = async (connectionOptions: ConnectionOptions): Promise<void> => {
        if (this.isConnected) return;

        this.__connectionOptions = connectionOptions;
        if (!this.__client) {
            this.__client = new MaxMarketDataClient(connectionOptions.apikey, connectionOptions.secretKey)
                .on('websocketOpened', this.__handleWebSocketOpened)
                .on('websocketError', this.__handleErrorEvent)
                .on('websocketClosed', (code: number, reason: Buffer) => {})
                .on('error', () => {})
                .on('subscribed', this.__handleSubscribedEvent)
                .on('unsubscribed', () => {})
                .on('marketStatusSnapshot', () => {})
                .on('tickerSnapshot', () => {})
                .on('marketTradeSnapshot', () => {})
                .on('orderBookSnapshot', () => {})
                .on('marketStatusUpdate', () => {})
                .on('tickerUpdate', () => {})
                .on('marketTradeUpdate', () => {})
                .on('orderBookUpdate', () => {})
                ;
        }

        // Check Rest API server is enabled.
        const serverTime = await this.__client.getServerTime();
        console.log(`[INFO] - Check REST API server availiable. ServerTime: ${new Date(serverTime)}`);

        if (serverTime) {
            this.__client.connectWebSocket();
        }
    }
    
    private __handleWebSocketOpened = async () => {
        this.isConnected = true;
        
        const maxMarkets = await this.__client?.getMarkets();
        this.__instruments = maxMarkets?.map(market => {
            return {
                symbol: market.id.toUpperCase(),
                description: market.name.toUpperCase(),
                exchange: 'MAX'
            }
        });
        console.log(`[INFO] - Download instruments data completed. (${this.__instruments?.length})`);

        if (this.__instruments?.length !== 0) {
            this.__client?.subscribeMarketStatus();
        }
    }

    private __handleErrorEvent = (error: Error) => {
        console.log(`[Error] - Error from websocket: ${error}`);
    }

    private __handleSubscribedEvent = () => {
        console.log(`[INFO] - Subscribed`);
    }

    private __handleUnsubscribedEvent = () => {
        console.log(`[INFO] - Unsubscribed`);
    }
    
    private __handleOrderBookEvent = () => {
        const orderBookEvent = {
            timestamp: 12313215665,
            market: 'BTCTWD',
            asks: [],
            bids: [],
        }
    }

    private __handleMarketTradeEvent = () => {
    }

    private __handleTickerEvent = () => {
    }

    private __handleMarketStatusEvent = () => {
    }

    private __handleOrderBookUpdateEvent = () => {}
    private __handleMarketTradeUpdateEvent = () => {}

    private __emitConnectedEvent = (): boolean => this.emit('connected');
    private __emitDisconnectedEvent = (): boolean => this.emit('disconnected');
    private __emitInstrumentEvent = (instruments: Array<Instrument>): boolean => this.emit('instrument', instruments)
    private __emitTickEvent = (tick: Tick): boolean => this.emit('tick', tick);
    private __emitOrderBookEvent = (orderbook: OrderBook): boolean => this.emit('orderBook', orderbook);
}




(async () => {
    const feed = new MaxDataFeed();

    // Connect to datafeed.
    await feed.connect({
        apikey: process.env.API_KEY as string,
        secretKey: process.env.SECRET_KEY as string,
    });



})();
