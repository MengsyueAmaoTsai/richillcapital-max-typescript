import MaxMarketDataClient from '../richillcapital-max/market-data-client';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY as string;
const SECRET_KEY = process.env.SECRET_KEY as string;

(async () => {
    const market = 'USDTTWD';

    const client = new MaxMarketDataClient(API_KEY, SECRET_KEY);
    
    client.connectWebSocket();

    client
        .on('websocketOpened', () => {
            console.log('MDC webscoekt opened');
            // client.subscribeMarketStatus();
            // client.subscribeTicker(market);
            // client.subscribeOrderBook(market);
            // client.subscribeMarketTrade(market);
        })
        .on('websocketError', (error: Error) => {
            console.log(`MDC WS error: ${error}`);
        })
        .on('websocketClose', (code: number, reason: Buffer) => {
            console.log(`MDC WS closed: Code: ${code} Reason: ${reason}`);
        })

})();

