import * as dotenv from 'dotenv';
import MaxMarketDataClient from '../richillcapital-max/market-data-client';

dotenv.config();

const API_KEY = process.env.API_KEY as string;
const SECRET_KEY = process.env.SECRET_KEY as string;

(async () => {
    const market = 'USDTTWD';

    const client = new MaxMarketDataClient(API_KEY, SECRET_KEY);
    
    // Get server time
    // const serverTime = await client.getServerTime();
    // console.log(`Server time: ${serverTime}`);

    // Get all markets
    // const markets = await client.getMarkets();
    // console.log(`Markets: ${markets.length}`);

    // Get k lines
    const kLines = await client.getKLines(market);
    console.log(kLines);

    // Get orderbook
    const orderBook = await client.getOrderBook(market);

    // Get tickers
    const tickers = await client.getTickers(market);

    // Get market trades 
    const marketTrades = await client.getMarketTrades(market);

    // Get summary
    const summary = await client.getSummary();
})();

