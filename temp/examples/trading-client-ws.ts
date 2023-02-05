import * as dotenv from 'dotenv';
import MaxTradingClient from '../richillcapital-max/trading-client';


dotenv.config();

const API_KEY = process.env.API_KEY as string;
const SECRET_KEY = process.env.SECRET_KEY as string;

(async () => {
    const client = new MaxTradingClient(API_KEY, SECRET_KEY);
    client.connectWebSocket();

    client
        .on('websocketOpened', () => {
            console.log('TC webscoekt opened');
            // client.authenticate();
            // client.subscribeAccount();
            // client.subscribeOrder();
            // client.subscribeTrade();
        })
        .on('websocketError', (error: Error) => {
            console.log(`TC WS error: ${error}`);
        })
        .on('websocketClose', (code: number, reason: Buffer) => {
            console.log(`TC WS closed: Code: ${code} Reason: ${reason}`);
        })
})();

