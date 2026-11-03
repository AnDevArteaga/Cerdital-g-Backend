import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import request from "supertest";
import { app } from "../src/app";
import pool from "../src/config/db";
import redis from "../src/config/redis";

before(async () => {
    await pool.query(`
        TRUNCATE progreso, ventas, salud_tratamiento, alimentacion, costos, agenda, lotes, usuarios
        RESTART IDENTITY CASCADE
    `);
    await redis.flushdb();
});

after(async () => {
    await pool.end();
    redis.disconnect();
});

async function account(name: string) {
    const email = `${name}-${Date.now()}@granja.test`;
    const password = "clave-demo-1";
    const registered = await request(app).post("/api/auth/register").send({
        fullName: name,
        phone: "3001234567",
        email,
        password,
    });
    assert.equal(registered.status, 200);

    const login = await request(app).post("/api/auth/login").send({
        email,
        password,
        token: "",
    });
    assert.equal(login.status, 200);
    return {
        id: login.body.user.id as number,
        token: login.body.user.token as string,
    };
}

function auth(token: string) {
    return { authorization: `Bearer ${token}` };
}

test("un lote guarda el pesaje y la venta entra a la utilidad", async () => {
    const owner = await account("norte");

    const created = await request(app)
        .post("/api/batch/createBatch")
        .set(auth(owner.token))
        .send({
            user_id: owner.id,
            batch_name: "Lote norte",
            pigs: 10,
            race: "Landrace",
            average_weight: 20,
            phase: 4,
        });
    assert.equal(created.status, 200);

    const batches = await request(app)
        .get(`/api/batch/getBatchById/${owner.id}`)
        .set(auth(owner.token));
    assert.equal(batches.status, 200);
    assert.equal(batches.body.batch.length, 1);
    assert.equal(Number(batches.body.batch[0].numeros_cerdos_actuales), 10);
    const batchId = batches.body.batch[0].id_lote;

    const weighed = await request(app)
        .post("/api/progress/createProgress")
        .set(auth(owner.token))
        .send({
            batch_id: batchId,
            date_weight: "2026-03-01",
            weekly_average_weight: 28,
            mortality: 0,
            phase: 4,
            user_id: owner.id,
        });
    assert.equal(weighed.status, 200);

    const progress = await request(app)
        .get(`/api/progress/getProgressById/${owner.id}`)
        .set(auth(owner.token));
    assert.equal(progress.status, 200);
    assert.equal(Number(progress.body.progress[0].record[0].weekly_average_weight), 28);

    const sold = await request(app)
        .post("/api/finance/createSales")
        .set(auth(owner.token))
        .send({
            batch_id: batchId,
            pig_sold: 2,
            average_weight: 100,
            price_kg: 8000,
            user_id: owner.id,
        });
    assert.equal(sold.status, 201);

    const home = await request(app)
        .get(`/api/home/${owner.id}`)
        .set(auth(owner.token));
    assert.equal(home.status, 200);
    assert.equal(home.body.totalSales, 1_600_000);
    assert.equal(home.body.profit, 1_600_000);
});

test("otro usuario no lee el lote ni cambia la contraseña sin sesión", async () => {
    const owner = await account("dueño");
    const other = await account("vecino");

    await request(app)
        .post("/api/batch/createBatch")
        .set(auth(owner.token))
        .send({
            user_id: owner.id,
            batch_name: "Lote privado",
            pigs: 4,
            race: "Duroc",
            average_weight: 30,
            phase: 4,
        });

    const leaked = await request(app)
        .get(`/api/batch/getBatchById/${owner.id}`)
        .set(auth(other.token));
    assert.equal(leaked.status, 403);

    const openReset = await request(app)
        .post("/api/auth/changePassword")
        .send({ email: "dueño@granja.test", password: "otra-clave" });
    assert.equal(openReset.status, 401);
});
