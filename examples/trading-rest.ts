
import * as dotenv from 'dotenv';
import * as winston from 'winston';
import { MaxTradingClient } from '../richillcapital-max';


dotenv.config();


(async () => {
    const apiKey: string = String(process.env.API_KEY);
    const secretKey: string = String(process.env.SECRET_KEY);

    const client = new MaxTradingClient(apiKey, secretKey);

    // Public endpoints
    await client.getServerTime();
    await client.getAllMarkets();
    await client.getAllCurrencies();

    // Private endpoints
    await client.me();
    await client.getProfile();
    await client.getAllAccounts();
    await client.getVipLevelInfo();
})();
