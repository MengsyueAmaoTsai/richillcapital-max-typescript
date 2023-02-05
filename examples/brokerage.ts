import * as dotenv from 'dotenv';


dotenv.config();



(async () => {
    const apiKey: string = String(process.env.API_KEY);
    const secretKey: string = String(process.env.SECRET_KEY);    
})();
