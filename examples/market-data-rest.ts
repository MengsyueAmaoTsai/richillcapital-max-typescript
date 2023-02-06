
import { EventEmitter } from 'events';
import * as dotenv from 'dotenv';
import * as winston from 'winston';
import { MaxMarketDataClient } from '../richillcapital-max';


(async () => {

    const apiKey: string = String(process.env.API_KEY);
    const secretKey: string = String(process.env.SECRET_KEY);

    const market = 'BTCTWD'
    const client = new MaxMarketDataClient(apiKey, secretKey);
    client
        .on('websocketOpen', () => {
            client.subscribeMarketStatus();
            client.subscribeOrderBook(market);
            client.subscribeTicker(market);
            client.subscribeMarketTrade(market);
        })
        .on('websocketClose', () => {
        })
        .on('websocketError', (error: Error) => {
            console.log(error);
        })
        .on('websocketMessage', (message: string) => {
            console.log(message);
        });


    await client.getServerTime();
    await client.getAllMarkets();
    await client.getMarketSummary();
    await client.getCandles(market);
    await client.getMarketTrades(market);
    await client.getOrderBook(market);
    await client.getTicker(market);

    client.connectWebSocket();
})();
