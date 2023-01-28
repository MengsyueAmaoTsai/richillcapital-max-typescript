import MaxClient from '../richillcapital-max';
import * as dotenv from 'dotenv';

dotenv.config();

(async () => {
    const apiKey = process.env.API_KEY as string;
    const secretKey = process.env.SECRET_KEY as string;
    console.log(apiKey, secretKey);

    const client = new MaxClient();

    // Get Markets
    const markets = await client.getMarkets();
    console.log(`Markets of MAX: ${markets.length}`);

    // Get currencies
    const currencies = await client.getCurrencies();
    console.log(`Currencies of MAX: ${currencies.length}`);

    // Get tickers of all market
    const market = 'btctwd';
    const ticker = await client.getTickers(market);
    console.log(ticker);
})();

