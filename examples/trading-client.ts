import * as dotenv from 'dotenv';
import MaxTradingClient from '../richillcapital-max/trading-client';

dotenv.config();

const API_KEY = process.env.API_KEY as string;
const SECRET_KEY = process.env.SECRET_KEY as string;




(async () => {
    const client = new MaxTradingClient(API_KEY, SECRET_KEY);

    // Get profile 
    const profile = await client.getProfile();
    console.log(profile);
})();

