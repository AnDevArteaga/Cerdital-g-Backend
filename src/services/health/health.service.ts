import { createHealth, getHealthById, updatedHealth, deleteHealth } from "../../repositories/health.repository";
import { assertOwner } from "../../repositories/access.repository";
import { findClient } from "../../repositories/client.repository";

export const getHealthByIdUser = async (user_id: number) => {
    const health = await getHealthById(user_id);
    if (health.length < 1) throw new Error("No has detectado ninguna enfermedad");
    return health;
};

export const createHealthUser = async (
    batch_id: number,
    disease: string,
    treatment: string,
    user_id: number,
    clientId: string | null = null,
) => {
    if (!batch_id) throw new Error("No hay lote seleccionado");
    if (!disease) throw new Error("No hay enfermedad");
    if (!treatment) throw new Error("No hay tratamiento");
    if (!user_id) throw new Error("No hay usuario");
    if (clientId) {
        const existing = await findClient("salud_tratamiento", clientId, user_id);
        if (existing) return { message: "tratamiento creado exitosamente", record: existing };
    }
    await assertOwner("lote", batch_id, user_id);

    const healthCreated = await createHealth(
        batch_id,
        disease,
        treatment,
        user_id,
        clientId,
    );
    if (!healthCreated) {
        if (!clientId) throw new Error("Error al crear el tratamiento");
        const existing = await findClient("salud_tratamiento", clientId, user_id);
        if (!existing) throw new Error("Error al crear el tratamiento");
        return { message: "tratamiento creado exitosamente", record: existing };
    }
    return { message: "tratamiento creado exitosamente", record: healthCreated };
};

export const deleteHealthUser = async (health_id: number, user_id: number) => {
    await assertOwner("salud", health_id, user_id);
    if (!health_id) throw new Error("No hay tratamiento seleccionado");
    const deletedHealth = await deleteHealth(health_id);
    if (deletedHealth === 0) throw new Error("Error al eliminar el tratamiento");
    return "tratamiento eliminado exitosamente";
};

export const editHealthUser = async (
    health_id: number,
    batch_id: number,
    disease: string,
    treatment: string,
    user_id: number,
) => {
    await assertOwner("salud", health_id, user_id);
    await assertOwner("lote", batch_id, user_id);
    if (!health_id) throw new Error("No hay salud seleccionada");
    if (!batch_id) throw new Error("No hay lote seleccionado");
    if (!disease) throw new Error("No hay enfermedad");
    if (!treatment) throw new Error("No hay tratamiento");

    

    const updatedHealthRow = await updatedHealth(health_id, batch_id, disease, treatment);
    if (updatedHealthRow === 0) throw new Error("Error al actualizar el tratamiento");
    return "salud actualizada exitosamente";
};  