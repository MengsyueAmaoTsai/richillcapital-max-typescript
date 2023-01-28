
const REST_URL = 'https://max-api.maicoin.com';

interface VipLevel {
    level: number;
    minTradingVolume: number;
    minStakingVolume: number;
    makerFee: number;
    takerFee: number;
}

interface VipLevelData {
    level: number,
    minimum_trading_volume: number,
    minimum_staking_volume: number,
    taker_fee: number,
    maker_fee: number,    
}

class MaxClient {
    protected _apiKey: string;
    protected _secretKey: string;

    public constructor(apiKey: string, secretKey: string) {
        this._apiKey = apiKey;
        this._secretKey = secretKey;
    }

    //#region REST API Public

    /**
     * Get all vip level fees.
     */
    public getVipLevels = async (): Promise<VipLevel[]> => {
        const endpoint = '/api/v2/vip_levels';

        const url = REST_URL + endpoint;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status !== 200) {
            console.log(`Something went wrong on fetch()`);
            return [] as VipLevel[]
        } else {
            const data = await response.json();
            return data.map((item: VipLevelData) => {
                return {
                    level: item.level,
                    minTradeVolume: item.minimum_trading_volume,
                    minStakingVolume: item.minimum_staking_volume,
                    takerFee: item.taker_fee,
                    makerFee: item.maker_fee,
                }
            });
        }
    }

    public getVipLevel = async (level: number): Promise<VipLevel | null> => {
        const endpoint = `/api/v2/vip_levels/${level}`;

        const url = REST_URL + endpoint;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status !== 200) {
            console.log(`Something went wrong on fetch()`);
            return null;
        } else {
            const data: VipLevelData = await response.json();
            return {
                level: data.level,
                minStakingVolume: data.minimum_staking_volume,
                minTradingVolume: data.minimum_trading_volume,
                takerFee: data.taker_fee,
                makerFee: data.maker_fee 
            }
        }        
    }

    //#endregion
}

export default MaxClient;