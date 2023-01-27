

class MaxClient {
    private _apiKey: string;
    private _secretKey: string;

    constructor(apiKey: string, secretKey: string) {
        this._apiKey = apiKey;
        this._secretKey = secretKey;
    }
}

export default MaxClient;