import * as crypto from 'crypto';
import { RawData } from 'ws';
import MaxClient from "./client";
import {  MaxBalance, MaxCurrency, MaxProfile, MaxTrade, MaxVipLevel } from './interfaces';
import { AccountVipLevelInfo, Balance, Currency, InternalTransfer, Order, Profile, RestResponse, Trade } from './max-types';

interface MaxTradingClient {
    authenticate: () => void;
};

class MaxTradingClient extends MaxClient {

    public constructor(apiKey: string, secretKey: string) {
        super(apiKey, secretKey)
    }

    /**
     * Get all available currencies.
     */
    public getCurrencies = async (): Promise<MaxCurrency[]> => {
        const currencies = await this._sendPublicRequest<Currency[]>('GET', '/api/v2/currencies');
        return currencies.map(currency => {
            return {
                id: currency.id.toUpperCase(),
                precision: currency.precision,
                sygnaSupported: currency.sygna_supported,
                mWalletSupported: currency.m_wallet_supported,
                minBorrowAmount: Number(currency.min_borrow_amount)
            };
        });
    }

    /**
     * Get your profile and accounts information
     */
    public getMe = async (): Promise<void> => {
        const nonce = Date.now();
        const me = await this._sendPrivateRequest('GET', '/api/v2/members/me', { nonce });
        console.log(me);
    };

    /**
     * Get personal profile information
     * @returns 
     */
    public getProfile = async (): Promise<MaxProfile> => {
        const nonce = Date.now();
        const profile = await this._sendPrivateRequest<Profile>('GET', '/api/v2/members/profile', { nonce });
        return {
            userId: profile.sn,
            name: profile.name,
            email: profile.email,
            language: profile.language,
            countryCode: profile.country_code,
            phoneNumber: profile.phone_number,
            status: profile.status,
            profileVerified: profile.profile_verified,
            kycState: profile.kyc_state, 
            anyKycRejected: profile.any_kyc_rejected,
            agreementChecked: profile.agreement_checked,
            level: profile.level,
            vipLevel: profile.vip_level,
            memberType: profile.member_type, 
            supplementalDocumentType: profile.supplemental_document_type,
            avatarUrl: profile.avatar_url ?? '',
            avatarNftOwnershipSerialNumber: profile.avatar_nft_ownership_sn ?? '' 
        }        
    };

    /**
     * Get current vip level info.
     * @returns 
     */
    public getCurrentVipLevel = async (): Promise<MaxVipLevel> => {
        const nonce = Date.now();
        const levelInfo = await this._sendPrivateRequest<AccountVipLevelInfo>('GET', '/api/v2/members/vip_level', { nonce })
        const currentLevel = levelInfo.current_vip_level
        return {
            level: currentLevel.level,
            minTradingVolume: currentLevel.minimum_trading_volume,
            minStakingVolume: currentLevel.minimum_staking_volume,
            makerFee: currentLevel.maker_fee,
            takerFee: currentLevel.taker_fee
        }
    };

    /**
     * Get personal accounts information
     * @returns 
     */
    public getBalances = async (): Promise<MaxBalance[]> => {
        const nonce = Date.now();
        const balances = await this._sendPrivateRequest<Balance[]>('GET', '/api/v2/members/accounts', { nonce });
        return balances.map(item => {
            return {
                currencyId: item.currency.toUpperCase(),
                type: item.type,
                balance: Number(item.balance),
                locked: Number(item.locked),
                stacked: Number(item.staked) ?? 0,
            }
        })
    };

    /**
     * Get personal accounts information of a currency
     * @param currencyId 
     * @returns 
     */
    public getBalanceByCurrency = async (currencyId: string): Promise<MaxBalance> => {
        const nonce = Date.now();
        const balance = await this._sendPrivateRequest<Balance>('GET', `/api/v2/members/accounts/${currencyId.toLowerCase()}`, { nonce });
        return {
            currencyId: balance.currency.toUpperCase(),
            type: balance.type,
            balance: Number(balance.balance),
            locked: Number(balance.locked),
            stacked: Number(balance.staked) ?? 0,
        }
    };

    /**
     * Get your executed trades, sorted in reverse creation order.
     * @param market 
     * @param limit 
     * @returns 
     */
    public getTrades = async (market: string, limit: number = 1000): Promise<MaxTrade[]> => {
        const nonce = Date.now();
        const parameters = {
            market: market.toLowerCase(),
            limit,
            nonce,
        }
        const trades = await this._sendPrivateRequest<Trade[]>('GET', '/api/v2/trades/my', parameters);
        return trades.map(t => {
            return {
                orderId: t.order_id,
                id: t.id,
                price: Number(t.price),
                tradeVolume: Number(t.funds),
                quantity: Number(t.volume),
                market: t.market.toUpperCase(),
                marketName: t.market_name,
                side: t.side,
                fee: Number(t.fee),
                feeCurrency: t.fee_currency,
                createdAt: t.created_at,
                createdAtMS: t.created_at_in_ms
            }
        });
    };

    /**
     * Get your executed trades related to a order
     * @param orderId 
     * @returns 
     */
    public getTradesByOrderId = async (orderId: number): Promise<MaxTrade[]> => {
        const parameters = {
            nonce: Date.now(),
            id: orderId,
        }
        const trades = await this._sendPrivateRequest<Trade[]>('GET', '/api/v2/trades/my/of_order', parameters);
        return trades.map(t => {
            return {
                orderId: t.order_id,
                id: t.id,
                price: Number(t.price),
                tradeVolume: Number(t.funds),
                quantity: Number(t.volume),
                market: t.market.toUpperCase(),
                marketName: t.market_name,
                side: t.side,
                fee: Number(t.fee),
                feeCurrency: t.fee_currency,
                createdAt: t.created_at,
                createdAtMS: t.created_at_in_ms
            }
        });
    };

    /**
     * Get your executed trades related to a order
     * @param clientOrderId 
     * @returns 
     */
    public getTradesByClientOrderId = async (clientOrderId: string): Promise<MaxTrade[]> => {
        const parameters = {
            nonce: Date.now(),
            client_oid: clientOrderId,
        }
        const trades = await this._sendPrivateRequest<Trade[]>('GET', '/api/v2/trades/my/of_order', parameters);
        return trades.map(t => {
            return {
                orderId: t.order_id,
                id: t.id,
                price: Number(t.price),
                tradeVolume: Number(t.funds),
                quantity: Number(t.volume),
                market: t.market.toUpperCase(),
                marketName: t.market_name,
                side: t.side,
                fee: Number(t.fee),
                feeCurrency: t.fee_currency,
                createdAt: t.created_at,
                createdAtMS: t.created_at_in_ms
            }
        });
    };

    /**
     * Create a order.
     * @param market 
     * @param side 
     * @param orderType 
     * @param quantity 
     * @returns 
     */
    public placeOrder = async (market: string, side: string, orderType: string, quantity: number): Promise<any> => {
        const parameters = {
            nonce: Date.now(),
            market: market.toLowerCase(),
            side: side.toLowerCase(),
            ord_type: orderType.toLowerCase(),
            volume: String(quantity)
        }
        const result = await this._sendPrivateRequest<Order | RestResponse>('POST', '/api/v2/orders', parameters);
        return {
        }
    };

    public getOrders = async (market: string, state: string = 'done', limit: number = 1000): Promise<void> => {
        const parameters = {
            nonce: Date.now(),
            market: market,
            state: state,
            limit: limit,
        }
        const orders = await this._sendPrivateRequest('GET', '/api/v2/orders', parameters);
        console.log(orders);
    };

    public getOrder = async (orderId: number): Promise<void> => {
        const parameters = {
            nonce: Date.now(),
            id: orderId,
        }
        const order = await this._sendPrivateRequest<Order>('GET', '/api/v2/order', parameters);
        console.log(order);
    };

    public cancelOrdersByMarket = async (market: string): Promise<void> => {
        const parameters = {
            nonce: Date.now(),
            market: market.toLowerCase(),
        }
        const cancelledOrders = await this._sendPrivateRequest<Order[]>('POST', '/api/v2/orders/clear', parameters);
        console.log(cancelledOrders);
    };    

    public cancelOrdersBySide = async (side: string): Promise<void> => {
        const parameters = {
            nonce: Date.now(),
            side: side.toLowerCase()
        }
        const cancelledOrders = await this._sendPrivateRequest<Order[]>('POST', '/api/v2/orders/clear', parameters);
        console.log(cancelledOrders);
    };    

    public cancelOrder = async (): Promise<void> => {
        const parameters = {
            nonce: Date.now(),
        }
        const cancelledOrder = await this._sendPrivateRequest<Order>('POST', '/api/v2/order/delete', parameters);
    };

    public getOrderHistory = async (limit: number = 1000): Promise<void> => {
        const paramters = {
            nonce: Date.now(),
            limit: limit
        }
        const orders = await this._sendPrivateRequest<Order[]>('GET', '/api/v2/orders/history', paramters);
    };

    public placeMultiOrders = async (market: string): Promise<void> => {
        const parameters = {
            nonce: Date.now(),
            market: market.toLowerCase(),
        }
        const result = await this._sendPrivateRequest('POST', '/api/v2/orders/multi/onebyone', parameters);
        console.log(result);
    };

    public getInternalTransfers = async (currencyId: string, side: string = 'in', limit: number = 1000, pagenation: boolean = false): Promise<void> => {
        const parameters = {
            nonce: Date.now(),
            currency: currencyId,
            limit: limit,
            side: side,
            pagenation: pagenation
        };
        const internalTransfers = await this._sendPrivateRequest<InternalTransfer[]>('GET', '/api/v2/internal_transfers', parameters);
        console.log(internalTransfers);
    };

    public getInternalTransfer = async (id: string): Promise<void> => {
        const parameters = {
            nonce: Date.now(),
            uuid: id
        };
        const internalTransfer = await this._sendPrivateRequest<InternalTransfer>('GET', '/api/v2/internal_transfer', parameters);
        console.log(internalTransfer);
    };

    public withdrawTwd = async (amount: number) => {
        const parameters = {
            nonce: Date.now(),
            amount: String(amount)
        }
        const withdrawal = await this._sendPrivateRequest('POST', '/api/v2/withdrawal/twd', parameters);
        console.log(withdrawal);
    };

    public getWithdraw = async (id: string) => {
        const parameters = {
            nonce: Date.now(),
            uuid: id
        }
        const withdrawal = await this._sendPrivateRequest('GET', '/api/v2/withdrawal', parameters);
        console.log(withdrawal);
    };

    public withdraw = async (currencyId: string, amount: number) => {
        const parameters = {
            nonce: Date.now(),
            currency: currencyId,
            amount: String(amount),
        }   
        const withdrawal = await this._sendPrivateRequest('POST', '/api/v2/withdrawal', parameters);
        console.log(withdrawal);
    };

    public getWithdrawAddresses = async (limit: number = 1000) => {
        const parameters = {
            nonce: Date.now(),
            limit: limit

        }
        const addresses = await this._sendPrivateRequest('GET', '/api/v2/withdraw_addresses', parameters);
        console.log(addresses);
    };

    public getWithdrawalHistory = async (currencyId: string, limit: number = 1000): Promise<void> => {
        const parameters = {
            nonce: Date.now(),
            limit: limit,
            currency: currencyId,

        }
        const withdrawalHistory = await this._sendPrivateRequest('GET', '/api/v2/withdrawals', parameters);
        console.log(withdrawalHistory);
    };
    
    /**
     * Send authentication message to server.
     */
    public authenticate = (): void => {
        const nonce = Date.now()
        const data = {
            action: 'auth',
            apiKey: this._apiKey,
            nonce: nonce,
            signature: this.__generateWebSocketSignature(nonce),
        };
        this._websocketClient?.send(JSON.stringify(data));        
    };

    public subscribeAccount = (): void => {
    };

    public unsubscribeAccount = (): void => {
    };

    public subscribeOrder = (): void => {
    };

    public unsubscribeOrder = (): void => {
    };

    public subscribeTrade = (): void => {
    };

    public unsubscribeTrade = (): void => {

    };    

    /**
     * Generate signature string for websocket authentication.
     * @param nonce 
     * @returns 
     */
    private __generateWebSocketSignature = (nonce: number): string => crypto.createHmac('sha256', this._secretKey).update(nonce.toString()).digest('hex');
    
    protected _onWebSocketMessage(data: RawData): void {
        const obj = JSON.parse(data.toString());
        const { e: eventType } = obj;

        switch (eventType) {
            case 'error':
                break;
            case 'subscribed':
                break;
            case 'unsubscribed':
                break;
            case 'authenticated':
                break;
            case 'account_snapshot':
                break;
            case 'order_snapshot':
                break;
            case 'trade_snapshot':
                break;
            case 'account_update':
                break;
            case 'order_update':
                break;
            case 'trade_update':
                break;                
        }
    }
};


export default MaxTradingClient;
