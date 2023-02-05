import MaxMarketDataClient from "../richillcapital-max/market-data-client";
import * as dotenv from 'dotenv';
import { EventEmitter } from "events";


dotenv.config();


interface ConnectionOptions {
    apiKey: string;
    secretKey: string;
}

interface MaxDataFeed {
    
    on(event: 'connected', listener: () => void): this;
    on(event: 'disconnected', listener: () => void): this;
    on(event: 'reconnecting', listener: () => void): this;
    on(event: 'reconnected', listener: () => void): this;
    on(event: 'tick', listener: () => void): this;
    on(event: 'orderbook', listener: () => void): this;
    
    connect(options: ConnectionOptions): void;
    disconnect(): void;
    
    getInstruments();
    getHistoricalBars(symbol: string);
    getHistoricalTicks(symbol: string);
    
    subscribe(symbol: string): void;
    unsubscribe(symbol: string): void;
}


class MaxDataFeed extends EventEmitter {

    private client?: MaxMarketDataClient;
    private isConnected: boolean = false;

    public connect = (options: ConnectionOptions) => {
    }

    public disconnect = () => {
    }
}


(async () => {
    const feed = new MaxDataFeed();

    // Connect to datafeed.
    await feed.connect({
        apikey: String(process.env.API_KEY),
        secretKey: String(process.env.SECRET_KEY),
    });
})();
