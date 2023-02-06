
import * as dotenv from 'dotenv';
import * as winston from 'winston';
import { MaxMarketDataClient } from '../richillcapital-max';


dotenv.config();


(async () => {

    const apiKey: string = String(process.env.API_KEY);
    const secretKey: string = String(process.env.SECRET_KEY);

    const market = 'BTCTWD'
    const client = new MaxMarketDataClient(apiKey, secretKey)
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
        .on('marketTradeUpdate', () => {
            
        })
        .on('marketTradeSnapshot', () => {

        })
        .on('marketStatusUpdate', () => {

        })
        .on('marketStatusSnapshot', () => {

        })
        .on('orderbookSnapshot', () => {

        })
        .on('orderbookUpdate', () => {

        })
        .on('tickerSnapshot', () => {

        })
        .on('tickerUpdate', () => {

        });

    client.connectWebSocket();
})();
