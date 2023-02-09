
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

export interface Trade {
    id: number; // i
    market: string; // M
    side: 'bid' | 'ask'; // sd
    price: number; // p
    volume: number; // v
    fee: number; // f
    feeCurrency: string; // fc
    createdAt: number; // T
    updatedAt: number; // TU
    orderId: number; // oi
}

export interface AccountBalance {
    currency: string; // cu
    available: number; // av
    locked: number; // l
    staked: number; // stk
    updatedAt: number; // TU
}

export type OrderMessage = {
    timestamp: number;
    channel: 'user';
    event: 'order_snapshot' | 'order_update';
    orders: Array<Order>;
}

export type TradeMessage = {
    channel: 'user';
    event: 'trade_snapshot' | 'trade_update';
    timestamp: number;
    trades: Array<Trade>
}

export type AccountMessage = {
    channel: 'user';
    event: 'account_snapshot' | 'account_update';
    timestamp: number;
    balances: Array<AccountBalance>
}