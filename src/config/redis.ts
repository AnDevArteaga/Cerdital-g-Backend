import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
    host: process.env.RD_HOST,
    port: 18800,  
    password: process.env.RD_PASSWORD, 
});

export const checkConnection = async () => {
    try {
        const client = await redis.ping();
        console.log("Conectado");
    } catch (error) {
        console.error("Error", error);
        process.exit(1);
    }
};

export default redis;
