import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import EmbeddedPostgres from "embedded-postgres";
import { gracefulExit } from "exit-hook";
import { RedisMemoryServer } from "redis-memory-server";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databaseDir = fs.mkdtempSync(path.join(os.tmpdir(), "cerdital-pg-"));
const logs = [];

function freePort() {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            const chosen = typeof address === "object" && address ? address.port : 55432;
            server.close(() => resolve(chosen));
        });
    });
}

const port = await freePort();
const database = new EmbeddedPostgres({
    databaseDir,
    port,
    user: "cerdital",
    password: "cerdital",
    persistent: false,
    onLog: (message) => logs.push(String(message)),
    onError: (error) => logs.push(String(error)),
});

const redis = new RedisMemoryServer({
    instance: { ip: "127.0.0.1", port: 56379 },
});

async function applySchema() {
    const client = new pg.Client({
        host: "127.0.0.1",
        port,
        user: "cerdital",
        password: "cerdital",
        database: "cerdital",
    });
    await client.connect();
    const schema = fs.readFileSync(path.join(root, "db/schema.sql"), "utf8");
    const statements = schema
        .split(/;\s*(?:\n|$)/)
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);
    for (const statement of statements) {
        await client.query(statement);
    }
    await client.end();
}

let exitCode = 1;
try {
    process.on("uncaughtException", (error) => {
        console.error(error || logs.join(""));
        process.exit(1);
    });
    await database.initialise();
    await database.start();
    await database.createDatabase("cerdital");
    await applySchema();
    const redisPort = await redis.getPort();

    exitCode = await new Promise((resolve) => {
        const child = spawn(
            process.execPath,
            ["-r", "ts-node/register", "-r", "./tests/env.js", "--test", "tests/api.test.ts"],
            {
                cwd: root,
                stdio: "inherit",
                env: {
                    ...process.env,
                    DB_HOST: "127.0.0.1",
                    DB_PORT: String(port),
                    DB_USER: "cerdital",
                    DB_PASSWORD: "cerdital",
                    DB_NAME: "cerdital",
                    RD_HOST: "127.0.0.1",
                    RD_PORT: String(redisPort),
                    JWT_SECRET: "test-secret-test-secret-test-secret",
                    PUBLIC_URL: "http://127.0.0.1:5000",
                    TS_NODE_TRANSPILE_ONLY: "1",
                },
            },
        );
        child.on("exit", (code) => resolve(code ?? 1));
    });
} catch (error) {
    console.error(error || logs.join(""));
    exitCode = 1;
} finally {
    await Promise.race([
        Promise.allSettled([redis.stop(), database.stop()]),
        new Promise((resolve) => setTimeout(resolve, 4000)),
    ]);
}

process.exitCode = exitCode;
gracefulExit();
