import * as dotenv from 'dotenv';
import MaxTradingClient from '../richillcapital-max/trading-client';

dotenv.config();

const API_KEY = process.env.API_KEY as string;
const SECRET_KEY = process.env.SECRET_KEY as string;




(async () => {
    const client = new MaxTradingClient(API_KEY, SECRET_KEY);
    
    // Get server time
    // const serverTime = await client.getServerTime();
    // console.log(`Server time: ${serverTime}`);

    // Get all markets
    // const markets = await client.getMarkets();
    // console.log(`Markets: ${markets.length}`);

    // Get me
    // const me = await client.getMe();
    // console.log(me);

    // Get profile 
    // const profile = await client.getProfile();
    // console.log(profile);

    // Get vip level
    // const level = await client.getCurrentVipLevel();
    // console.log(level);

    // Get all balances
    // const balances = await client.getAllAccountBalances();
    // console.log(`Balances: ${balances.length}`);

    // Get balance by currency
    // const balance = await client.getBalanceByCurrency('twd');
    // console.log(balance);

    // Get trades
    const trades = await client.getTrades('usdttwd');
})();

