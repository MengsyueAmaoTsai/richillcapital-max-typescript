import * as dotenv from 'dotenv';
import MaxMarketDataClient from '../richillcapital-max/market-data-client';

dotenv.config();

(async () => {
    const apiKey = process.env.API_KEY as string;
    const secretKey = process.env.SECRET_KEY as string;

    // Market name for example
    const market = 'usdttwd';

    const client = new MaxMarketDataClient();

    // Get server time.
    const serverTime = await client.getServerTime();

    // Get Markets
    const markets = await client.getMarkets();

    // Get ticker
    const ticker = await client.getTickers(market);
    // console.log(ticker);

    // Get depth.
    const depth = await client.getOrderBook(market);
    // console.log(depth);

    // Get k
    const kLines = await client.getKLines(market);

    // Get market trades
    const trades = await client.getMarketTrades(market);

    // Get summary
    const summary = await client.getSummary();

    // Get vip levels

    // Get vip level.


    // Get currencies
    // const currencies = await client.getCurrencies();
    // console.log(`Currencies of MAX: ${currencies.length}`);

    // Get me.
    // const me = await client.getMe();
    // console.log(me);

    // Get profile.
    // const profile = await client.getProfile();
    // console.log(profile);

    // Get all accounts.
    // const accounts = await client.getAccounts();
    // console.log(`Accounts of MAX: ${accounts.length}`);

    // Get account.
    // const account = await client.getAccount('twd');
    // console.log('Account:', account);

    // Get deposit history.
    // const deposits = await client.getDepositHistory('twd', );
    // console.log(`Deposits: ${deposits.length}`);

    // Get details of deposit.
    // const transactionId = '20220224-2-20481-1024286256470639-6516655';
    // const depositDetail = await client.getDepositDetail(transactionId);
    // console.log(depositDetail);

    // Get deposit addresses.
    // const address = await client.getDepositAddresses('twd');

    // Get orders
    // const orders = await client.getOrders(market);

    // Get trades
    // const trades = await client.getTrades(market);
})();

