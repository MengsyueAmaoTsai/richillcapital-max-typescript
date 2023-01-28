import MaxClient from '../richillcapital-max';

const apiKey = process.env.API_KEY as string;
const secretKey = process.env.SECRET_KEY as string;

const client = new MaxClient(apiKey, secretKey);


(async () => {
    const vipLevels = await client.getVipLevels();
    vipLevels.forEach(level => {
        console.log(`
Level: ${level.level} 
MinTradeVolume: ${level.minStakingVolume}
MakerFee: ${level.makerFee}
TakerFee: ${level.takerFee}
        `);
    })


    const vipLevel = await client.getVipLevel(5);
    console.log(vipLevel);
})();

