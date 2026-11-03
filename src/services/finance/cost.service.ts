import {
    getCostById,
    updatedCost,
} from "../../repositories/cost.repository";
import { assertOwner } from "../../repositories/access.repository";

export const getCostByIdUser = async (user_id: number) => {
    if (!user_id) throw new Error("Sin usuario")
    const cost = await getCostById(user_id);
    if (cost.length < 1) throw new Error("No has creado ningún costo");
    return cost;
};

export const editCostUser = async (
    cost_id: number,
    batch_id: number,
    purchase_pigs: number,
    feeding: number,
    medicine: number,
    handwork: number,
    transport: number,
    other: number,
    user_id: number,
) => {
    await assertOwner("costo", cost_id, user_id);
    await assertOwner("lote", batch_id, user_id);
    const updatedCostRow = await updatedCost(
        cost_id,
        batch_id,
        purchase_pigs,
        feeding,
        medicine,
        handwork,
        transport,
        other,
    );
    if (updatedCostRow === 0) throw new Error("Error al actualizar el costo");
    return "Costo actualizado exitosamente";
};