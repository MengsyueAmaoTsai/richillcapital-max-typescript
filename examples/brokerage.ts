import * as dotenv from 'dotenv';
import EventEmitter from 'events';
import * as winston from 'winston';
import { MaxTradingClient } from '../richillcapital-max';

dotenv.config();

const getLogger = (): winston.Logger => {
    return winston.createLogger({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(info => {
                return `${info.timestamp} - [${info.level.toUpperCase()}] - ${info.message}`;
            }),
        ),
        transports: [
            new winston.transports.Console(),
        ]
    });
}

interface Balance {
    amount: number;
    currency: string;
}

interface Account {
    id: string;
    name: string;

    balances: Array<Balance>
}

interface Order {
    id: string;
    clientOrderId: string;

    symbol: string;
    tradeType: 'buy' | 'sell';
    orderType: 'market' | 'limit';
    quantity: number;
    price: number;
    timeInForce: 'ROD' | 'IOC' | 'FOK';
    status: 'pending' | 'rejected' | 'cancelled' | 'partiallyFilled' | 'filled';
}

interface ConnectionOptions {
    apiKey: string;
    secretKey: string;
}

class MaxBrokerage extends EventEmitter {
    private logger: winston.Logger = getLogger();
    private client?: MaxTradingClient;
    private options?: ConnectionOptions;
    private isConnected: boolean = false;


    public constructor() {
        super();
    }

    public connect = async (options: ConnectionOptions): Promise<void> => {
        this.logger.info(`Connecting to MAX...`);
    }

    public disconnect = () => {
        this.logger.info(`Disconnecting from MAX`);
    }

    public placeOrder = async (order: Order) => {
        this.logger.info(`Place order`);
    }

    public cancelOrder = async (order: Order) => {
        this.logger.info(`Cancel order`);
    }

    public getAllOrders = async (): Promise<Array<Order>> => {
        this.logger.info(`Get all orders`);
        return []
    }

    public getAllAccounts = async () => {
        this.logger.info(`Get all accounts`);
    }
}

(async () => {
    const apiKey: string = String(process.env.API_KEY);
    const secretKey: string = String(process.env.SECRET_KEY);    

    const broker = new MaxBrokerage();
    await broker.connect({ apiKey, secretKey });
})();
