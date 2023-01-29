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
            console.log(data);
        } catch (error) {
            console.log(`Error when send request to ${uri} Error: ${error}`);
        }
    };

}


export default MaxMarketDataClient;
