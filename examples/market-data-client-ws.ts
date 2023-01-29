import MaxMarketDataClient from '../richillcapital-max/market-data-client';
import * as dotenv from 'dotenv';

dotenv.config();

(async () => {
    const apiKey = process.env.API_KEY as string;
    const secretKey = process.env.SECRET_KEY as string;

    // Market name for example
    const market = 'usdttwd';

    const client = new MaxMarketDataClient();
    
    client.on('marketTradeSnapshot', () => {

    });
    
    client.on('marketTradeUpdate', () => {

    });

    client.on('orderBookSnapshot', () => {

    });
    
    client.on('orderBookUpdate', () => {

    });

    
    client.on('tickerSnapshot', () => {

    });
    
    client.on('tickerUpdate', () => {

    });

    
    client.on('marketStatusSnapshot', () => {

    });
    
    client.on('marketStatusUpdate', () => {

    });

    client.on('error', () => {

    });

    client.on('open', () => {

    });


    client.on('close', () => {

    });
})();

