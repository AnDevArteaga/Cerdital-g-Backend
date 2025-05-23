import {
    createProgress,
    getProgressById,
    updateProgress,
} from "../../repositories/progress.repository";

import {
    ListProgressLote,
    Progress,
} from "../../interfaces/progress.interface";

import {
    getOneBatchById,
    updatedBatch,
} from "../../repositories/batch.repository";

import { getPhaseById } from "../../repositories/list.repository";

export const getProgressByIdUser = async (user_id: number) => {
    if (!user_id) throw new Error("Sin usuario");
    const progress = await getProgressById(user_id);
    console.log(progress);
    if (progress.length < 1) throw new Error("No has creado ningún progreso");
    const progressWithPhaseName = await Promise.all(
        progress.map(async (item) => {
            const phaseData = await getPhaseById(item.fase);
            const phase = Array.isArray(phaseData) ? phaseData[0] : phaseData;

            return {
                ...item,
                fase: phase?.nombre_fase || "Fase desconocida",
            };
        }),
    );
    console.log(progressWithPhaseName, "progressWithPhaseName");
    const transformed = tranformProgress(progressWithPhaseName);
    console.log(JSON.stringify(transformed, null, 2), "tranform");
    return transformed;
};

export const createProgressUser = async (
    batch_id: number,
    date_weight: string,
    weekly_average_weight: number,
    mortality: number,
    phase: number,
    user_id: number,
) => {
    if (!batch_id) throw new Error("No hay lote seleccionado");
    if (!user_id) throw new Error("No hay usuario");
    if (!date_weight) throw new Error("No hay fecha de peso");
    if (!weekly_average_weight) throw new Error("No hay peso promedio");
    if (mortality === undefined || mortality === null) {
        throw new Error("No hay mortalidad");
    }
    if (!phase) throw new Error("No hay fase");

    let current_pig = 0;
    console.log("mortality", mortality);
    // Si la mortalidad es mayor a 0, validar contra current pigs
    const batch = await getOneBatchById(batch_id);
    if (batch.length < 1) throw new Error("No existe el lote");
    console.log("batch", batch);
    current_pig = batch[0].numeros_cerdos_actuales;

    if (current_pig < mortality) {
        throw new Error(
            "No puedes registrar una mortalidad mayor a la cantidad de cerdos en el lote",
        );
    }

    console.log("current_pig", current_pig);
    const progressCreated = await createProgress(
        batch_id,
        date_weight,
        weekly_average_weight,
        mortality,
        user_id,
        phase,
    );
    if (progressCreated === 0) throw new Error("Error al crear el progreso");
    const updatedPhaseBatch = await updatedBatch(
        batch_id,
        undefined,
        undefined,
        undefined,
        undefined,
        phase,
        undefined,
    );

    if (updatedPhaseBatch === 0) throw new Error("Error al actualizar el lote");
    // Calcular nuevo número de cerdos
    const newCurrent = current_pig - mortality;
    console.log("newCurrent", newCurrent);
    // Actualizar el lote
    const progressBatch = await getProgressById(user_id);
    const progressTransformed = tranformProgress(progressBatch);
    const newMortality = progressTransformed.progress.find((item) => item.batch_id === batch_id)?.mortality || 0;

    const batchUpdated = await updatedBatch(
        batch_id,
        undefined,
        undefined,
        undefined,
        newCurrent,
        newMortality,
        phase,
    );

    if (!batchUpdated || typeof batchUpdated !== "object") {
        throw new Error("Error inesperado al actualizar el lote");
    }

    const { rowCount, current_pig_in_db } = batchUpdated;

    // Verificar rowCount
    if (rowCount === 0) {
        throw new Error("Error al actualizar el lote");
    }
    // Si current_pig_in_db es 0, actualizar el estado del lote
    if (current_pig_in_db === 0) {
        const newStatus = false;
        const updatedBatchStatus = await updatedBatch(
            batch_id,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            newStatus,
        );

        if (!updatedBatchStatus || typeof updatedBatchStatus !== "object") {
            throw new Error("Error inesperado al actualizar el lote");
        }

        if (updatedBatchStatus.rowCount === 0) {
            throw new Error("Error al actualizar el estado del lote");
        }
    }

    return "Progreso creado exitosamente";
};

export const updateProgressUser = async (
    progress_id: number,
    batch_id: number,
    date_weight: string,
    weekly_average_weight: number,
    mortality: number,
    phase: number,
) => {
    if (!progress_id) throw new Error("No hay progreso seleccionado");
    if (!batch_id) throw new Error("No hay lote seleccionado");
    if (!date_weight) throw new Error("No hay fecha de peso");
    if (!weekly_average_weight) throw new Error("No hay peso promedio");
    if (mortality === undefined || mortality === null) {
        throw new Error("No hay mortalidad");
    }
    if (!phase) throw new Error("No hay fase");

    let current_pig = 0;
    let current_mortality = 0;

    // Si la mortalidad es mayor a 0, validar contra current pigs
    if (mortality > 0) {
        const batch = await getOneBatchById(batch_id);
        if (batch.length < 1) throw new Error("No existe el lote");

        current_pig = batch[0].numeros_cerdos_actuales;
        current_mortality = batch[0].mortalidad;


        if (current_pig < mortality) {
            throw new Error(
                "No puedes registrar una mortalidad mayor a la cantidad de cerdos en el lote",
            );
        }
    }

    // Actualizar progreso
    const progressUpdated = await updateProgress(
        progress_id,
        batch_id,
        date_weight,
        weekly_average_weight,
        mortality,
        phase,
    );

    if (progressUpdated === 0) {
        throw new Error("Error al actualizar el progreso");
    }

    // Calcular nuevo número de cerdos
    const newCurrent = current_pig - mortality;
    
    // Actualizar el lote
    const batchUpdated = await updatedBatch(
        batch_id,
        undefined,
        undefined,
        undefined,
        newCurrent,
        phase,
    );

    if (!batchUpdated || typeof batchUpdated !== "object") {
        throw new Error("Error inesperado al actualizar el lote");
    }

    const { rowCount, current_pig_in_db } = batchUpdated;

    // Verificar rowCount
    if (rowCount === 0) {
        throw new Error("Error al actualizar el lote");
    }

    // Si current_pig_in_db es 0, actualizar el estado del lote
    if (current_pig_in_db === 0) {
        const newStatus = false;
        const updatedBatchStatus = await updatedBatch(
            batch_id,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            newStatus,
        );

        if (!updatedBatchStatus || typeof updatedBatchStatus !== "object") {
            throw new Error("Error inesperado al actualizar el lote");
        }

        if (updatedBatchStatus.rowCount === 0) {
            throw new Error("Error al actualizar el estado del lote");
        }
    }

    return "Progreso actualizado exitosamente";
};



function tranformProgress(progress: any[]): Progress {
    const lotesMap = new Map<number, ListProgressLote>();
    const mortality: Record<number, number> = {};
    console.log(progress, "progress");
    progress.forEach((item) => {
        const id = item.id_lote;
        if (!mortality[id]) {
            mortality[id] = 0;
        }
        mortality[id] += item.mortalidad;

        console.log(mortality, "mortalidad");
        if (!lotesMap.has(item.id_lote)) {
            lotesMap.set(item.id_lote, {
                batch_id: item.id_lote,
                mortality: 0,
                goal_average_weight: item.peso_promedio_objetivo,
                record: [],
            });
        }
        lotesMap.get(item.id_lote)!.record.push({
            progress_id: item.id_progreso,
            date_weight: item.fecha_pesaje,
            weekly_average_weight: item.record_peso_promedio,
            phase: item.fase,
        });
    });

    lotesMap.forEach((lote, id) => {
        lote.mortality = mortality[id] || 0;
    });
    return { progress: Array.from(lotesMap.values()) };
}
