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
        email,
        password,
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
    assert.equal(typeof created.body.record.client_id, "string");
    assert.equal(typeof created.body.record.costo.client_id, "string");

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

test("la app sincroniza en tandas y una venta repetida no resta dos veces", async () => {
    const owner = await account("sync");
    const other = await account("ajena");
    const lote = "11111111-1111-4111-8111-111111111111";
    const costo = "22222222-2222-4222-8222-222222222222";
    const pesaje = "33333333-3333-4333-8333-333333333333";
    const venta = "44444444-4444-4444-8444-444444444444";
    const deMas = "55555555-5555-4555-8555-555555555555";

    const pushed = await request(app)
        .post("/api/sync/push")
        .set(auth(owner.token))
        .send({
            changes: [
                {
                    client_id: lote,
                    type: "lote",
                    action: "crear",
                    data: {
                        batch_name: "Lote sync",
                        pigs: 10,
                        race: "Landrace",
                        average_weight: 20,
                        phase: 4,
                        cost_client_id: costo,
                    },
                },
                {
                    client_id: pesaje,
                    type: "pesaje",
                    action: "crear",
                    data: {
                        batch_client_id: lote,
                        date_weight: "2026-03-02",
                        weekly_average_weight: 30,
                        mortality: 1,
                        phase: 4,
                    },
                },
                {
                    client_id: costo,
                    type: "costo",
                    action: "editar",
                    data: {
                        purchase_pigs: 1000,
                        feeding: 0,
                        medicine: 0,
                        handwork: 0,
                        transport: 0,
                        other: 0,
                    },
                },
                {
                    client_id: venta,
                    type: "venta",
                    action: "crear",
                    data: {
                        batch_client_id: lote,
                        pig_sold: 2,
                        average_weight: 90,
                        price_kg: 7000,
                    },
                },
                {
                    client_id: deMas,
                    type: "venta",
                    action: "crear",
                    data: {
                        batch_client_id: lote,
                        pig_sold: 20,
                        average_weight: 90,
                        price_kg: 7000,
                    },
                },
            ],
        });
    assert.equal(pushed.status, 200);
    assert.equal(pushed.body.results[0].status, "guardado");
    assert.equal(pushed.body.results[1].status, "guardado");
    assert.equal(pushed.body.results[2].status, "guardado");
    assert.equal(pushed.body.results[3].status, "guardado");
    assert.equal(pushed.body.results[4].status, "conflicto");
    assert.equal(Number(pushed.body.results[3].record.lote.numeros_cerdos_actuales), 7);

    const again = await request(app)
        .post("/api/sync/push")
        .set(auth(owner.token))
        .send({
            changes: [
                {
                    client_id: venta,
                    type: "venta",
                    action: "crear",
                    data: {
                        batch_client_id: lote,
                        pig_sold: 2,
                        average_weight: 90,
                        price_kg: 7000,
                    },
                },
            ],
        });
    assert.equal(again.status, 200);
    assert.equal(again.body.results[0].status, "guardado");

    const batches = await request(app)
        .get(`/api/batch/getBatchById/${owner.id}`)
        .set(auth(owner.token));
    assert.equal(Number(batches.body.batch[0].numeros_cerdos_actuales), 7);

    const home = await request(app)
        .get(`/api/home/${owner.id}`)
        .set(auth(owner.token));
    assert.equal(home.status, 200);
    assert.equal(home.body.totalSales, 1_260_000);
    assert.equal(home.body.totalCosts, 1000);
    assert.equal(home.body.profit, 1_259_000);

    const pulled = await request(app)
        .get("/api/sync/pull")
        .set(auth(owner.token));
    assert.equal(pulled.status, 200);
    assert.equal(pulled.body.lotes.length, 1);
    assert.equal(pulled.body.pesajes.length, 1);
    assert.equal(pulled.body.ventas.length, 1);
    assert.equal(pulled.body.costos.length, 1);

    const quiet = await request(app)
        .get("/api/sync/pull")
        .query({ since: pulled.body.cursor })
        .set(auth(owner.token));
    assert.equal(quiet.body.lotes.length, 0);
    assert.equal(quiet.body.ventas.length, 0);

    const removed = await request(app)
        .post("/api/sync/push")
        .set(auth(owner.token))
        .send({
            changes: [{ client_id: venta, type: "venta", action: "borrar" }],
        });
    assert.equal(removed.body.results[0].status, "guardado");
    assert.equal(Number(removed.body.results[0].record.lote.numeros_cerdos_actuales), 9);
    assert.ok(removed.body.results[0].record.deleted_at);

    const after = await request(app)
        .get("/api/sync/pull")
        .query({ since: pulled.body.cursor })
        .set(auth(owner.token));
    assert.equal(after.body.ventas.length, 1);
    assert.ok(after.body.ventas[0].deleted_at);

    const stolen = await request(app)
        .post("/api/sync/push")
        .set(auth(other.token))
        .send({
            changes: [
                {
                    client_id: venta,
                    type: "venta",
                    action: "crear",
                    data: {
                        batch_client_id: lote,
                        pig_sold: 1,
                        average_weight: 90,
                        price_kg: 7000,
                    },
                },
            ],
        });
    assert.equal(stolen.body.results[0].status, "conflicto");

    const foreign = await request(app)
        .get("/api/sync/pull")
        .set(auth(other.token));
    assert.equal(foreign.body.lotes.length, 0);
    assert.equal(foreign.body.ventas.length, 0);

    const tooMany = await request(app)
        .post("/api/sync/push")
        .set(auth(owner.token))
        .send({
            changes: Array.from({ length: 21 }, () => ({
                client_id: lote,
                type: "lote",
                action: "editar",
                data: { batch_name: "Otro" },
            })),
        });
    assert.equal(tooMany.status, 400);
});

test("el super admin ve las granjas y un usuario no entra al panel", async () => {
    const farm = await account("granja-panel");
    const boss = await account("super-panel");

    await request(app)
        .post("/api/batch/createBatch")
        .set(auth(farm.token))
        .send({
            user_id: farm.id,
            batch_name: "Lote del panel",
            pigs: 6,
            race: "Yorkshire",
            average_weight: 18,
            phase: 3,
        });

    const blocked = await request(app)
        .get("/api/admin/overview")
        .set(auth(farm.token));
    assert.equal(blocked.status, 403);

    await pool.query("UPDATE usuarios SET rol = 'superadmin' WHERE id_usuario = $1", [boss.id]);
    const again = await request(app).post("/api/auth/login").send({
        email: boss.email,
        password: boss.password,
        token: "",
    });
    assert.equal(again.body.user.rol, "superadmin");
    const bossToken = again.body.user.token as string;

    const overview = await request(app)
        .get("/api/admin/overview")
        .set(auth(bossToken));
    assert.equal(overview.status, 200);
    assert.ok(overview.body.usuarios >= 1);
    assert.ok(overview.body.granjas.some((item: { correo: string }) => item.correo === farm.email));

    const detail = await request(app)
        .get(`/api/admin/users/${farm.id}`)
        .set(auth(bossToken));
    assert.equal(detail.status, 200);
    assert.equal(detail.body.lotes.length, 1);
    assert.equal(detail.body.lotes[0].nombre_lote, "Lote del panel");

    const hidden = await request(app)
        .get(`/api/admin/users/${farm.id}`)
        .set(auth(farm.token));
    assert.equal(hidden.status, 403);
});
