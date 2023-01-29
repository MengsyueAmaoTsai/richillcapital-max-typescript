


import MaxClient from '../richillcapital-max';
import * as dotenv from 'dotenv';

dotenv.config();

(async () => {
    const apiKey = process.env.API_KEY as string;
    const secretKey = process.env.SECRET_KEY as string;

    // Market name for example
    const market = 'usdttwd';

    const client = new MaxClient();
    
    client.on('tradeSnapshot', () => {
        console.log('Trade Snapshort => ');
    });
    
    client.on('tradeUpdate', () => {
        console.log('On trade');
    });

    client.on('orderUpdate', () => {
        console.log('on order -> ');
    });
    
    client.on('orderSnapshot', () => {
        console.log(`On order snapshot`);
    });

    client.on('accountUpdate', () => {
        console.log(`on account update`);
    });
    
    client.on('accountSnapshot', () => {
        console.log(`on account snapshot`);
    });

    client.on('error', () => {
        console.log('on error.');
    });

    client.on('open', () => {
    });

    client.on('close', () => {
    });

    client.connect(apiKey, secretKey);
    client.subscribeMarketStatus();
    client.subscribeOrderBook(market);
    client.subscribeTicker(market);
    client.subscribeMarketTrade(market);

})();

