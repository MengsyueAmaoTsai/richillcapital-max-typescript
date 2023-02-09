
import * as dotenv from 'dotenv';
import { MaxMarketDataClient } from '../richillcapital-max';


dotenv.config();


(async () => {
    const apiKey: string = String(process.env.API_KEY);
    const secretKey: string = String(process.env.SECRET_KEY);
    const market = 'BTCTWD';

    const client = new MaxMarketDataClient(apiKey, secretKey);
    const serverTime = await client.getServerTime();
    const markets = await client.getAllMarkets();
    const summary = await client.getMarketSummary();
    const candles = await client.getCandles(market);
    const marketTrades = await client.getMarketTrades(market);
    const orderbook = await client.getOrderBook(market);
    const ticker = await client.getTicker(market);
})();
