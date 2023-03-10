import { EventEmitter } from 'events';
import * as dotenv from 'dotenv';
import * as winston from 'winston';
import { MaxMarketDataClient } from '../richillcapital-max';

dotenv.config();

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

interface ConnectionOptions {
    apiKey: string;
    secretKey: string;
}

interface Instrument {
    symbol: string;
    description: string;
    exchange: string;
}

interface Bar {
    symbol: string;
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface Tick {
    symbol: string;
    timestamp: number;
    price: number;
    size: number;
}

interface Depth {
    price: number;
    size: number;
}

interface OrderBook {
    symbol: string;
    timestamp: number;
    bids: Array<Depth>;
    asks: Array<Depth>;
}

interface MaxDataFeed {
    on(event: 'connected', listener: () => void): this;
    on(event: 'disconnected', listener: () => void): this;
    on(event: 'tick', listener: (tick: Tick) => void): this;
    on(event: 'orderbook', listener: (orderbook: OrderBook) => void): this;
}


class MaxDataFeed extends EventEmitter {
    private logger: winston.Logger = getLogger();
    private client?: MaxMarketDataClient;
    private options?: ConnectionOptions;
    private isConnected: boolean = false;

    public constructor() {
        super()
    }

    public connect = async (options: ConnectionOptions): Promise<void> => {
        if (this.isConnected) {
            this.logger.info(`MAX datafeed is already connected.`);
            return;
        }
        
        this.logger.info(`Connecting to MAX ...`);
        
        if (!this.client) {
            this.client = new MaxMarketDataClient(options.apiKey ?? '', options.secretKey ?? '');
            this.client.on('websocketOpen', this.onWebSocketOpened)
            this.client.on('marketStatusSnapshot', this.onMarketStatusSnapshot)
            this.client.on('marketStatusUpdate', this.onMarketStatusUpdate)
            ;
        }
        this.options = options;
        
        const serverTime = await this.client?.getServerTime();
        this.logger.info(`Server time: ${serverTime}`);
        
        if (!serverTime) {
            this.logger.error(`Cannot connect to MAX API server.`);
            return;
        }

        // Connect to webscoekt
        this.client.connectWebSocket();

        this.logger.info(`Connected to MAX.`);
    }

    public disconnect = () => {
        this.logger.info(`Connecting from MAX ...`);
        
        this.logger.info(`Disconnected.`);
    }

    public getHistoricalBars = async (symbol: string): Promise<Array<Bar>> => {
        this.logger.info(`Downloading historical bars for ${symbol} ...`);
        return [];
    }

    public getHistoricalTicks = async (symbol: string): Promise<Array<Tick>> => {
        this.logger.info(`Downloading historical ticks for ${symbol} ...`);
        return [];
    }

    public getInstruments = async (): Promise<Array<Instrument>> => {
        this.logger.info(`Downloading instrument data ...`);
        const markets = await this.client?.getAllMarkets();
        return [];
    }

    public subscribe = (symbol: string): void => {
        this.logger.info(`Subscribe market data for ${symbol} ...`);
    }

    public unsubscribe = (symbol: string): void => {
        this.logger.info(`Unsubscribe market data for ${symbol} ...`);
    }

    private onWebSocketOpened = () => {
        this.logger.info(`MAX WebSocket Opened`);
        
        this.client?.subscribeMarketStatus();
        
        this.isConnected = true;
        this.emit('connected');
    }

    private onWebSocketClosed = () => {
        this.logger.info(`MAX Websocket server disconencted.`);

        this.emit('disconnected');
    }

    private onSubscribed = () => {

    }

    private onUnsubscribed = () => {

    }

    private onMarketStatusSnapshot = () => {
        this.logger.info(`Market status snapshot`);
    }

    private onMarketStatusUpdate = () => {
        this.logger.info(`Market status updated`);
    }
    
    private onMarketTradeSnapshot = () => {

    }

    private onMarketTradeUpdate = () => {

    }

    private onOrderBookSnapshot = () => {

    }

    private onOrderBookUpdate = () => {
        this.emit('orderbook');
    }

    private onTickerSnapshot = () => {

    }

    private onTickerUpdate = () => {
        this.emit('tick');
    }
}


(async () => {

    const apiKey: string = String(process.env.API_KEY);
    const secretKey: string = String(process.env.SECRET_KEY);

    const feed = new MaxDataFeed();
    feed.on('connected', () => {})
        .on('disconnected', () => {})
        .on('tick', (tick: Tick) => {})
        .on('orderbook', (orderbook: OrderBook) => {});

    await feed.connect({
        apiKey,
        secretKey
    });

    const instruments = await feed.getInstruments();
    console.log(`Instruments: ${instruments.length}`);
    // const ticks = await feed.getHistoricalTicks(instruments[0].symbol);
    // const bars = await feed.getHistoricalBars(instruments[0].symbol);

    // feed.subscribe(instruments[0].symbol);
})();
