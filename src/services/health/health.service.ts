import { createHealth, getHealthById, updatedHealth, deleteHealth } from "../../repositories/health.repository";

export const getHealthByIdUser = async (user_id: number) => {
    const health = await getHealthById(user_id);
    if (health.length < 1) throw new Error("No has detectado ninguna enfermedad");
    return health;
};

export const createHealthUser = async (
    batch_id: number,
    disease: string,
    treatment: string,
    user_id: number
) => {
    if (!batch_id) throw new Error("No hay lote seleccionado");
    if (!disease) throw new Error("No hay enfermedad");
    if (!treatment) throw new Error("No hay tratamiento");
    if (!user_id) throw new Error("No hay usuario");

    const healthCreated = await createHealth(
        batch_id,
        disease,
        treatment,
        user_id,
    );
    if (healthCreated === 0) throw new Error("Error al crear el tratamiento");
    return "tratamiento creado exitosamente";
};

export const deleteHealthUser = async (health_id: number) => {
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
) => {
    if (!health_id) throw new Error("No hay salud seleccionada");
    if (!batch_id) throw new Error("No hay lote seleccionado");
    if (!disease) throw new Error("No hay enfermedad");
    if (!treatment) throw new Error("No hay tratamiento");

    

    const updatedHealthRow = await updatedHealth(health_id, batch_id, disease, treatment);
    if (updatedHealthRow === 0) throw new Error("Error al actualizar el tratamiento");
    return "salud actualizada exitosamente";
};  