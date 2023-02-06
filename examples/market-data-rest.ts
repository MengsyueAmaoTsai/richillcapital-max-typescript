
import { EventEmitter } from 'events';
import * as dotenv from 'dotenv';
import * as winston from 'winston';
import { MaxMarketDataClient } from '../richillcapital-max';


(async () => {

    const apiKey: string = String(process.env.API_KEY);
    const secretKey: string = String(process.env.SECRET_KEY);

    const market = 'BTCTWD'
    const client = new MaxMarketDataClient(apiKey, secretKey);

    await client.getServerTime();
    await client.getAllMarkets();
    await client.getMarketSummary();
    await client.getCandles(market);
    await client.getMarketTrades(market);
    await client.getOrderBook(market);
    await client.getTicker(market);
})();
