import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
    host: process.env.RD_HOST || "127.0.0.1",
    port: Number(process.env.RD_PORT || 6379),
    ...(process.env.RD_PASSWORD ? { password: process.env.RD_PASSWORD } : {}),
});

export const checkConnection = async () => {
    try {
        await redis.ping();
        console.log("Redis conectado");
    } catch (error) {
        console.error("Error", error);
        process.exit(1);
    }
};

export default redis;
