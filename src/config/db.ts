import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

export const checkConnection = async () => {
    try {
        const client = await pool.connect();
        console.log("Conectado");
        client.release();
    } catch (error) {
        console.error("Error", error);
        process.exit(1);
    }
};

export default pool;
