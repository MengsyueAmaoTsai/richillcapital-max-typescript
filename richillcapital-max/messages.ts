
export interface Order {
    id: number; // i
    side: 'bid' | 'ask'; // sd
    type: 'limit' | 'market' | 'stop_limit' | 'stop_market' | 'post_only' | 'ioc_limit';  // ot
    price: number // p
    stopPrice: number; // sp
    averagePrice: number; // ap
    volume: number; // v
    remainVolume: number; // rv
    executedVolume: number; // ev
    state: string; // S
    market: string; // M
    tradeCount: number; // tc 
    createdAt: number; // T
    updatedAt: number; // TU
    groupOrderId: number | null; // gi
    clientOrderId: string | null; // ci
}

export type OrderMessage = {
    timestamp: number;
    channel: 'user';
    event: 'order_snapshot';
    orders: Array<Order>;
}