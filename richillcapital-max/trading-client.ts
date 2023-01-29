import * as crypto from 'crypto';
import MaxClient from "./client";
import { MaxBalance, MaxProfile, MaxTrade, MaxVipLevel } from './interfaces';
import { AccountVipLevelInfo, Balance, Profile, Trade } from './max-types';

interface MaxTradingClient {
    authenticate: () => void;
};

class MaxTradingClient extends MaxClient {

    public constructor(apiKey: string, secretKey: string) {
        super(apiKey, secretKey)
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
        })
    };

    public getTradesByOrderId = async (orderId: number, clientOrderId: string) => {
        const endpoint = `/api/v2/trades/my/of_order`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            id: orderId,
            client_oid: clientOrderId,
        }

        const uri = this._buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }               
    };

    public getOrders = async (market: string, state: string = 'done', limit: number = 1000) => {
        const endpoint = `/api/v2/orders`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            market: market,
            state: state,
            limit: limit,
        }

        const uri = this._buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }               
    };

    public getOrder = async (orderId: number) => {
        const endpoint = `/api/v2/order`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            id: orderId,
        }

        const uri = this._buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }               
    };

    public placeOrder = async (market: string, side: string, orderType: string) => {
        const endpoint = `/api/v2/orders`;
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            market: market,
            side: side,
            ord_type: orderType,
        }

        const uri = this._buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }               
    };

    public cancelOrder = async (market: string, side: string) => {
        const endpoint = '/api/v2/orders/clear';
        
        if (!this._apiKey || !this._secretKey) {
            return Promise.reject(new Error("Missing API KEY or SECRET KEY"));
        }

        const parameters = {
            nonce: Date.now(),
            market: market,
            side: side
        }

        const uri = this._buildUri(endpoint, parameters);
        console.log(`Request Uri: ${uri}`);
        
        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._generateAuthHeaders(endpoint, parameters)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
            return;
        }               
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
    private __generateWebSocketSignature = (nonce: number): string => 
        crypto.createHmac('sha256', this._secretKey).update(nonce.toString()).digest('hex');
};

export default MaxTradingClient;
