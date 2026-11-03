import "./polyfill";
import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import { checkConnection } from "./config/db";
import { checkConnection as checkRedis } from "./config/redis";
import { startAgendaJob } from "./jobs/agendaCronJob";

if (!process.env.JWT_SECRET) {
    console.error("Falta JWT_SECRET");
    process.exit(1);
}

const PORT = Number(process.env.PORT || 5000);

Promise.all([checkConnection(), checkRedis()]).then(() => {
    startAgendaJob();
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en ${PORT}`);
    });
});
