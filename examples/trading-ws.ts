
import { EventEmitter } from 'events';
import * as dotenv from 'dotenv';
import * as winston from 'winston';
import { MaxTradingClient } from '../richillcapital-max';


(async () => {

    const apiKey: string = String(process.env.API_KEY);
    const secretKey: string = String(process.env.SECRET_KEY);

    const market = 'BTCTWD';
    const client = new MaxTradingClient(apiKey, secretKey)
        .on('websocketOpen', () => {

        })
        .on('websocketClose', () => {
        })
        .on('websocketError', (error: Error) => {
            console.log(error);
        })
        ;
    client.connectWebSocket();
})();
