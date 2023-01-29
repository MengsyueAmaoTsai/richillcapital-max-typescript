import MaxClient from '../richillcapital-max';
import * as dotenv from 'dotenv';

dotenv.config();

(async () => {
    const apiKey = process.env.API_KEY as string;
    const secretKey = process.env.SECRET_KEY as string;

    // Market name for example
    const market = 'usdttwd';

    const client = new MaxClient();
    client.connect(apiKey, secretKey);

    client.subscribeMarketStatus();
})();

