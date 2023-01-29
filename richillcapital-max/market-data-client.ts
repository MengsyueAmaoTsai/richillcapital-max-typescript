import MaxClient from "./client";


class MaxMarketDataClient extends MaxClient {

    /**
     * Get depth of a specified market.
     * @param market 
     * @param limit 
     * @param sortByPrice 
     */
    public getOrderBook = async (market: string, limit: number = 300, sortByPrice: boolean = false): Promise<void> => {
        const endpoint = '/api/v2/depth';
        const parameters = {
            market: market,
            limit: limit,
            sort_by_price: sortByPrice
        }

        const uri = this._buildUri(endpoint, parameters);

        try {
            const response = await fetch(
                uri,
                {
                    method: 'GET',
                    headers: this._defaultHeaders
                }
            );

            const data = await response.json();
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
        }
    };

    public getKLines = async (market: string, period: number = 1, limit: number = 100, timestamp?: number): Promise<void> => {
        const endpoint = '/api/v2/k';
        const parameters = {
            market: market,
            period: period,
            limit: limit,
        }

        const uri = this._buildUri(endpoint, parameters);
        
        try {
            const response = await fetch(
                uri,
                {
                    method: 'GET',
                    headers: this._defaultHeaders
                }
            );
            const data = await response.json();
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
        }
    };

    public getMarketTrades = async (market: string, limit: number = 1000, orderBy: string = 'desc', pagenation: boolean = false) => {
        const endpoint = '/api/v2/trades';
        const parameters = {
            market: market,
            limit: limit,
            orderBy: orderBy,
            pagenation: pagenation,
        }

        const uri = this._buildUri(endpoint, parameters);
        
        try {
            const response = await fetch(
                uri,
                {
                    method: 'GET',
                    headers: this._defaultHeaders
                }
            );
            const data = await response.json();
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
        }        
    };

    public getSummary = async (): Promise<void> => {
        const endpoint = '/api/v2/summary';

        const uri = this._buildUri(endpoint);
        
        try {
            const response = await fetch(
                uri,
                {
                    method: 'GET',
                    headers: this._defaultHeaders
                }
            );
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
        }        
    };

    /**
     * Get ticker of specific market
     * @param market 
     * @returns 
     */
    public getTickers = async (market: string): Promise<void> => {
        const endpoint = `/api/v2/tickers/${market}`;

        const uri = this._buildUri(endpoint);
        console.log(`Request Uri: ${uri}`);

        try {
            const response = await fetch(uri, {
                method: 'GET',
                headers: this._defaultHeaders
            });
            const data = await response.json();
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
        }   
    };    
}


export default MaxMarketDataClient;
