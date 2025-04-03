import { createFeeding, getFeedingById, updatedFeeding } from "../../repositories/feeding.repository";

export const getFeedingByIdUser = async (user_id: number) => {
    const feeding = await getFeedingById(user_id);
    if (feeding.length < 1) throw new Error("No has creado ningúna alimentación");
    return feeding;
};

export const createFeedingUser = async (
    batch_id: number,
    feeding_type: string,
    feeding_mark: string,
    amount: number,
    cost: number,
    user_id: number

) => {
    if (!batch_id) throw new Error("No hay lote seleccionado");
    if (!feeding_type) throw new Error("No hay tipo de alimentación");
    if (!feeding_mark) throw new Error("No hay marca de alimentación");
    if (!amount) throw new Error("No hay cantidad en kilogramos");
    if (!cost) throw new Error("No hay costo unitario");
    if (!user_id) throw new Error("No hay usuario");

    const feedingCreated = await createFeeding(
        batch_id,
        feeding_type,
        feeding_mark,
        amount,
        cost,
        user_id,
    );
    if (feedingCreated === 0) throw new Error("Error al crear la alimentación");
    return "alimentación creada exitosamente";
};

export const editFeedingUser = async (
    feeding_id: number,
    batch_id: number,
    feeding_type: string,
    feeding_mark: string,
    amount: number,
    cost: number,
 ) => {
    if (!feeding_id) throw new Error("No hay alimentación seleccionada");
    if (!batch_id) throw new Error("No hay lote seleccionado");
    if (!feeding_type) throw new Error("No hay tipo de alimentación");
    if (!feeding_mark) throw new Error("No hay marca de alimentación");
    if (!amount) throw new Error("No hay cantidad en kilogramos");
    if (!cost) throw new Error("No hay costo unitario");


    const updatedFeedingRow = await updatedFeeding(feeding_id, feeding_type, feeding_mark, amount, cost);
    if (updatedFeedingRow === 0) throw new Error("Error al actualizar la alimentación");
    return "Alimentación actualizada exitosamente";
};

