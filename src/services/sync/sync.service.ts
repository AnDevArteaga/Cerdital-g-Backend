import { ForbiddenError } from "../../errors";
import { clearCache } from "../../middleware/cache.middleware";
import { assertOwner } from "../../repositories/access.repository";
import {
    findClient,
    optionalClientId,
    requiredClientId,
} from "../../repositories/client.repository";
import { getOneBatchById } from "../../repositories/batch.repository";
import { recomputeHerd, withTransaction } from "../../repositories/herd.repository";
import {
    pullRows,
    readClient,
    softDeleteClient,
    softDeleteLote,
    SyncTable,
    updateAgendaRow,
    updateFeedingRow,
    updateHealthRow,
    updateLote,
    updateProgressRow,
    updateSaleRow,
} from "../../repositories/sync.repository";
import { createAgendaUser } from "../agenda/agenda.service";
import { createBatchUser } from "../batch/batch.service";
import { createFeedingUser } from "../feeding/feeding.service";
import { editCostUser } from "../finance/cost.service";
import { createSalesUser } from "../finance/sales.service";
import { createHealthUser } from "../health/health.service";
import { createProgressUser } from "../progress/progress.service";

const MAX_CHANGES = 20;

type Change = {
    client_id: string;
    type: string;
    action: string;
    data: Record<string, unknown>;
};

export async function pushChanges(userId: number, changes: unknown) {
    if (!Array.isArray(changes)) throw new Error("Los cambios tienen que ir en una lista");
    if (changes.length > MAX_CHANGES) throw new Error("Manda hasta 20 cambios por tanda");

    const results = [];
    for (const change of changes) {
        results.push(await applyOne(userId, change));
    }

    await clearCache(`batch:${userId}`);
    await clearCache(`feeding:${userId}`);
    await clearCache(`sales:${userId}`);
    await clearCache(`home:${userId}`);
    return results;
}

export async function pullChanges(userId: number, sinceRaw: unknown) {
    let since: Date | null = null;
    if (typeof sinceRaw === "string" && sinceRaw !== "") {
        since = new Date(sinceRaw);
        if (Number.isNaN(since.getTime())) throw new Error("La marca since no es válida");
    }
    return pullRows(userId, since);
}

async function applyOne(userId: number, value: unknown) {
    let clientId = "";
    let type = "";
    let action = "";
    try {
        const change = asChange(value);
        clientId = change.client_id;
        type = change.type;
        action = change.action;
        const record = await dispatch(userId, change);
        return { client_id: clientId, type, action, status: "guardado", record };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error";
        return { client_id: clientId, type, action, status: "conflicto", message };
    }
}

function asChange(value: unknown): Change {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Cambio inválido");
    }
    const item = value as Record<string, unknown>;
    const data = item.data === undefined ? {} : item.data;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Cambio inválido");
    }
    return {
        client_id: requiredClientId(item.client_id),
        type: typeof item.type === "string" ? item.type : "",
        action: typeof item.action === "string" ? item.action : "",
        data: data as Record<string, unknown>,
    };
}

async function dispatch(userId: number, change: Change) {
    const { type, action, data, client_id: clientId } = change;
    if (action !== "crear" && action !== "editar" && action !== "borrar") {
        throw new Error("La acción no es válida");
    }

    if (type === "lote") return lote(userId, action, clientId, data);
    if (type === "alimentacion") return alimentacion(userId, action, clientId, data);
    if (type === "sanidad") return sanidad(userId, action, clientId, data);
    if (type === "pesaje") return pesaje(userId, action, clientId, data);
    if (type === "venta") return venta(userId, action, clientId, data);
    if (type === "costo") return costo(userId, action, clientId, data);
    if (type === "agenda") return agenda(userId, action, clientId, data);
    throw new Error("El tipo no es válido");
}

async function lote(userId: number, action: string, clientId: string, data: Record<string, unknown>) {
    if (action === "crear") {
        const saved = await createBatchUser(
            userId,
            text(data, "batch_name", "nombre de lote"),
            finite(data.pigs, "cantidad de cerdos"),
            text(data, "race", "raza"),
            finite(data.average_weight, "peso promedio"),
            finite(data.phase, "fase"),
            clientId,
            optionalClientId(data.cost_client_id),
        );
        return saved.record;
    }
    if (action === "editar") {
        const name = optionalText(data, "batch_name");
        const race = optionalText(data, "race");
        const weight = data.average_weight === undefined ? null : finite(data.average_weight, "peso promedio");
        const phase = data.phase === undefined ? null : finite(data.phase, "fase");
        if (name === null && race === null && weight === null && phase === null) {
            throw new Error("No hay datos para actualizar");
        }
        return withTransaction(async (client) => {
            const row = await updateLote(client, clientId, userId, name, race, weight, phase);
            if (!row) return missing(client, "lotes", clientId, userId);
            return row;
        });
    }
    return withTransaction(async (client) => {
        const current = await readClient(client, "lotes", clientId);
        if (!current) throw new Error("No existe el registro");
        if (Number(current.id_usuario) !== userId) throw new ForbiddenError();
        if (current.deleted_at) return current;
        const row = await softDeleteLote(client, current.id_lote, userId);
        if (!row) return current;
        return row;
    });
}

async function alimentacion(userId: number, action: string, clientId: string, data: Record<string, unknown>) {
    if (action === "crear") {
        const saved = await createFeedingUser(
            await batchIdOf(userId, data),
            text(data, "feeding_type", "tipo de alimentación"),
            text(data, "feeding_mark", "marca de alimentación"),
            finite(data.amount, "cantidad en kilogramos"),
            finite(data.cost, "costo unitario"),
            userId,
            clientId,
        );
        return saved.record;
    }
    if (action === "editar") {
        return withTransaction(async (client) => {
            const row = await updateFeedingRow(
                client,
                clientId,
                userId,
                text(data, "feeding_type", "tipo de alimentación"),
                text(data, "feeding_mark", "marca de alimentación"),
                finite(data.amount, "cantidad en kilogramos"),
                finite(data.cost, "costo unitario"),
            );
            if (!row) return missing(client, "alimentacion", clientId, userId);
            return row;
        });
    }
    return removeRow(userId, clientId, "alimentacion");
}

async function sanidad(userId: number, action: string, clientId: string, data: Record<string, unknown>) {
    if (action === "crear") {
        const saved = await createHealthUser(
            await batchIdOf(userId, data),
            text(data, "disease", "enfermedad"),
            text(data, "treatment", "tratamiento"),
            userId,
            clientId,
        );
        return saved.record;
    }
    if (action === "editar") {
        return withTransaction(async (client) => {
            const row = await updateHealthRow(
                client,
                clientId,
                userId,
                text(data, "disease", "enfermedad"),
                text(data, "treatment", "tratamiento"),
            );
            if (!row) return missing(client, "salud_tratamiento", clientId, userId);
            return row;
        });
    }
    return removeRow(userId, clientId, "salud_tratamiento");
}

async function pesaje(userId: number, action: string, clientId: string, data: Record<string, unknown>) {
    if (action === "crear") {
        const saved = await createProgressUser(
            await batchIdOf(userId, data),
            text(data, "date_weight", "fecha de peso"),
            finite(data.weekly_average_weight, "peso promedio"),
            finite(data.mortality, "mortalidad"),
            finite(data.phase, "fase"),
            userId,
            clientId,
        );
        return withLote(saved.record);
    }
    if (action === "editar") {
        return withTransaction(async (client) => {
            const row = await updateProgressRow(
                client,
                clientId,
                userId,
                text(data, "date_weight", "fecha de peso"),
                finite(data.weekly_average_weight, "peso promedio"),
                finite(data.mortality, "mortalidad"),
                finite(data.phase, "fase"),
            );
            if (!row) return missing(client, "progreso", clientId, userId);
            const lote = await recomputeHerd(
                client,
                row.id_lote,
                Number(row.fase),
                "No puedes registrar una mortalidad mayor a la cantidad de cerdos en el lote",
            );
            return { ...row, lote };
        });
    }
    const removed = await removeHerdRow(
        userId,
        clientId,
        "progreso",
        "No puedes registrar una mortalidad mayor a la cantidad de cerdos en el lote",
    );
    return removed;
}

async function venta(userId: number, action: string, clientId: string, data: Record<string, unknown>) {
    if (action === "crear") {
        const saved = await createSalesUser(
            await batchIdOf(userId, data),
            finite(data.pig_sold, "cerdos vendidos"),
            finite(data.average_weight, "peso promedio"),
            finite(data.price_kg, "precio en kilogramos"),
            userId,
            clientId,
        );
        return withLote(saved.record);
    }
    if (action === "editar") {
        return withTransaction(async (client) => {
            const row = await updateSaleRow(
                client,
                clientId,
                userId,
                finite(data.pig_sold, "cerdos vendidos"),
                finite(data.average_weight, "peso promedio"),
                finite(data.price_kg, "precio en kilogramos"),
            );
            if (!row) return missing(client, "ventas", clientId, userId);
            const lote = await recomputeHerd(
                client,
                row.id_lote,
                undefined,
                "Cerdos insuficientes para vender esa cantidad",
            );
            return { ...row, lote };
        });
    }
    return removeHerdRow(userId, clientId, "ventas", "Cerdos insuficientes para vender esa cantidad");
}

async function costo(userId: number, action: string, clientId: string, data: Record<string, unknown>) {
    if (action === "borrar") return removeRow(userId, clientId, "costos");
    const existing = await findClient("costos", clientId, userId);
    if (!existing) throw new Error("El costo nace con el lote");
    if (action === "crear") return existing;
    await editCostUser(
        existing.id_costo,
        existing.id_lote,
        finite(data.purchase_pigs, "compra de cerdos"),
        finite(data.feeding, "alimentación"),
        finite(data.medicine, "medicamentos"),
        finite(data.handwork, "mano de obra"),
        finite(data.transport, "transporte"),
        finite(data.other, "otros"),
        userId,
    );
    return findClient("costos", clientId, userId);
}

async function agenda(userId: number, action: string, clientId: string, data: Record<string, unknown>) {
    if (action === "crear") {
        const saved = await createAgendaUser(
            userId,
            text(data, "title", "título"),
            text(data, "description", "descripción"),
            text(data, "event_date", "fecha"),
            clientId,
        );
        return saved.record;
    }
    if (action === "editar") {
        const title = optionalText(data, "title");
        const description = optionalText(data, "description");
        const eventDate = optionalText(data, "event_date");
        if (title === null && description === null && eventDate === null) {
            throw new Error("No hay datos para actualizar");
        }
        return withTransaction(async (client) => {
            const row = await updateAgendaRow(client, clientId, userId, title, description, eventDate);
            if (!row) return missing(client, "agenda", clientId, userId);
            return row;
        });
    }
    return removeRow(userId, clientId, "agenda");
}

async function batchIdOf(userId: number, data: Record<string, unknown>) {
    if (data.batch_id !== undefined && data.batch_id !== null && data.batch_id !== "") {
        const id = Number(data.batch_id);
        if (!Number.isInteger(id)) throw new Error("No hay lote seleccionado");
        await assertOwner("lote", id, userId);
        return id;
    }
    const batchClientId = optionalClientId(data.batch_client_id);
    if (!batchClientId) throw new Error("No hay lote seleccionado");
    const lote = await findClient("lotes", batchClientId, userId);
    if (!lote) throw new Error("No existe el lote");
    return Number(lote.id_lote);
}

async function withLote(record: { id_lote: number }) {
    const lote = await getOneBatchById(record.id_lote);
    return { ...record, lote: lote[0] ?? null };
}

async function removeRow(userId: number, clientId: string, table: SyncTable) {
    return withTransaction(async (client) => {
        const row = await softDeleteClient(client, table, clientId, userId);
        if (row) return row;
        return alreadyGone(client, table, clientId, userId);
    });
}

async function removeHerdRow(userId: number, clientId: string, table: SyncTable, conflictMessage: string) {
    return withTransaction(async (client) => {
        const row = await softDeleteClient(client, table, clientId, userId);
        if (!row) return alreadyGone(client, table, clientId, userId);
        const lote = await recomputeHerd(client, row.id_lote, undefined, conflictMessage);
        return { ...row, lote };
    });
}

async function missing(client: import("pg").PoolClient, table: SyncTable, clientId: string, userId: number) {
    const row = await readClient(client, table, clientId);
    if (!row) throw new Error("No existe el registro");
    if (Number(row.id_usuario) !== userId) throw new ForbiddenError();
    if (row.deleted_at) throw new Error("El registro fue borrado");
    throw new Error("No existe el registro");
}

async function alreadyGone(client: import("pg").PoolClient, table: SyncTable, clientId: string, userId: number) {
    const row = await readClient(client, table, clientId);
    if (!row) throw new Error("No existe el registro");
    if (Number(row.id_usuario) !== userId) throw new ForbiddenError();
    if (row.deleted_at) return row;
    throw new Error("No existe el registro");
}

function text(data: Record<string, unknown>, key: string, label: string) {
    const value = data[key];
    if (typeof value !== "string" || value.trim() === "") throw new Error(`No hay ${label}`);
    return value.trim();
}

function optionalText(data: Record<string, unknown>, key: string) {
    if (data[key] === undefined || data[key] === null || data[key] === "") return null;
    if (typeof data[key] !== "string") throw new Error("Dato inválido");
    return (data[key] as string).trim();
}

function finite(value: unknown, label: string) {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error(`No hay ${label}`);
    return number;
}
