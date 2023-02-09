
import * as dotenv from 'dotenv';
import * as winston from 'winston';
import { MaxTradingClient } from '../richillcapital-max';


dotenv.config();


(async () => {
    const apiKey: string = String(process.env.API_KEY);
    const secretKey: string = String(process.env.SECRET_KEY);

    const client = new MaxTradingClient(apiKey, secretKey);

    await client.getServerTime();
    await client.getAllMarkets();

    await client.getAllCurrencies();
    
})();
