import * as dotenv from 'dotenv';
import MaxTradingClient from '../richillcapital-max/trading-client';

dotenv.config();

(async () => {
    const apiKey = process.env.API_KEY as string;
    const secretKey = process.env.SECRET_KEY as string;

    // Market name for example
    const market = 'usdttwd';

    const client = new MaxTradingClient();
    client.connectWebSocket(apiKey, secretKey);

    // Get server time.
    // const serverTime = await client.getServerTime();
    // console.log(`Server time: ${serverTime}`);

    // Get Markets
    // const markets = await client.getMarkets();
    // console.log(`Markets of MAX: ${markets.length}`);

    // Get currencies
    // const currencies = await client.getCurrencies();
    // console.log(`Currencies of MAX: ${currencies.length}`);

    // Get tickers of all market
    // const ticker = await client.getTickers(market);
    // console.log(ticker);

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

