import { MaxAccountBalance } from "./interfaces";



export interface WebSocketAccountMessage {
    timestamp: number;
    channel: string;
    eventType: string;
    balances: MaxAccountBalance[];
}

