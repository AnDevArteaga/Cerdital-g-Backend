import {
    createSales,
    deleteSales,
    getSalesById,
} from "../../repositories/sales.repository";

import {
    getOneBatchById,
    updatedBatch,
} from "../../repositories/batch.repository";

export const getSalesByIdUser = async (user_id: number) => {
    if (!user_id) throw new Error("Sin usuario");
    const sales = await getSalesById(user_id);
    if (sales.length < 1) throw new Error("No has creado ninguna venta");
    return sales;
};

export const createSalesUser = async (
    batch_id: number,
    pig_sold: number,
    average_weight: number,
    price_kg: number,
    user_id: number,
) => {
    if (!batch_id) throw new Error("No hay lote seleccionado");
    if (!pig_sold) throw new Error("No hay cerdos vendidos");
    if (!average_weight) throw new Error("No hay peso promedio");
    if (!price_kg) throw new Error("No hay precio en kilogramos");
    if (!user_id) throw new Error("No hay usuario");

    const batch = await getOneBatchById(batch_id);
    if (batch.length < 1) throw new Error("No existe el lote");
    console.log("batch", batch);
    const current_pig = batch[0].numeros_cerdos_actuales;
    if (pig_sold > current_pig) {
        throw new Error("Cerdos insuficientes para vender esa cantidad");
    }

    const salesCreated = await createSales(
        batch_id,
        pig_sold,
        average_weight,
        price_kg,
        user_id,
    );
    if (salesCreated === 0) throw new Error("Error al crear la venta");

    const newCurrent = current_pig - pig_sold;
    const batchUpdated = await updatedBatch(
        batch_id,
        undefined,
        undefined,
        undefined,
        newCurrent,
    );
    if (!batchUpdated || typeof batchUpdated !== "object") {
        throw new Error("Error inesperado al actualizar el lote");
    }
    const { rowCount, current_pig_in_db } = batchUpdated;
    if (rowCount === 0) {
        throw new Error("Error al actualizar el numero de cerdos en el lote");
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
            newStatus
        );

        if (!updatedBatchStatus || typeof updatedBatchStatus !== "object") {
            throw new Error("Error inesperado al actualizar el lote");
        }

        if (updatedBatchStatus.rowCount === 0) {
            throw new Error("Error al actualizar el estado del lote");
        }
    }

    return "venta creada exitosamente y numero de cerdos actualizado";
};

export const deleteSalesUser = async (sales_id: number) => {
    if (!sales_id) throw new Error("No hay venta seleccionada");
    const deleted = await deleteSales(sales_id);
    if (deleted === 0) throw new Error("Error al eliminar la venta");
    return "venta eliminada exitosamente";
};

// export const editSalesUser = async (
//     sales_id: number,
//     batch_id: number,
//     pig_sold: number,
//     average_weight: number,
//     price_kg: number,
//     user_id: number,
// ) => {
//     if (!batch_id) throw new Error("No hay lote seleccionado");
//     if (!pig_sold) throw new Error("No hay cerdos vendidos");
//     if (!average_weight) throw new Error("No hay peso promedio");
//     if (!price_kg) throw new Error("No hay precio en kilogramos");

//     const batch = await getOneBatchById(batch_id);
//     if (batch.length < 1) throw new Error("No existe el lote");
//     const current_pig = batch[0].numeros_cerdos_actuales;
//     const registered_pig = batch[0].numeros_cerdos_registrados;
//     if (pig_sold > current_pig) {
//         throw new Error("Cerdos insuficientes para vender esa cantidad");
//     }

//     // Obtener todas las ventas del usuario en este lote ordenadas por fecha
//     const sales = await getSalesById(user_id);
//     if (sales.length < 1) throw new Error("No hay ventas registradas");
//     console.log("sales", sales);

//     let newCurrent = 0;

//     if (sales.length === 1) {
//         // Si es la única venta
//         newCurrent = registered_pig - pig_sold;
//         console.log("newCurrent if 1", newCurrent);
//     } else {
//         // Identificar si está editando la primera venta o una posterior
//         const currentSaleIndex = sales.findIndex((sale) =>
//             sale.id_venta === sales_id
//         );
//         console.log("currentSaleIndex", currentSaleIndex);

//         if (currentSaleIndex === 0) {
//             // Si está editando la primera venta
//             newCurrent = registered_pig - pig_sold;

//             // Validar que newCurrent no sea menor a pig_sold de las siguientes ventas
//             for (let i = 1; i < sales.length; i++) {
//                 if (newCurrent < sales[i].cerdos_vendidos) {
//                     throw new Error(
//                         `No puedes vender más cerdos de los registrados. Revisión en venta ${
//                             sales[i].id_venta
//                         }`,
//                     );
//                 }
//                 newCurrent -= sales[i].cerdos_vendidos;
//                 console.log("newCurrent if 0", newCurrent);
//             }
//         } else {
//             // Si edita una venta que no es la primera
//             const previousSale = sales[currentSaleIndex - 1];
//             const current = current_pig -previousSale.cerdos_vendidos
//             newCurrent = current - pig_sold;
//             console.log("newCurrent if 2", newCurrent);
//             console.log("previousSale", previousSale);
//             // Validar que newCurrent no sea menor a pig_sold de las siguientes ventas
//             for (let i = currentSaleIndex + 1; i < sales.length; i++) {
//                 if (newCurrent < sales[i].cerdos_vendidos) {
//                     throw new Error(
//                         `No puedes vender más cerdos de los registrados. Revisión en venta ${
//                             sales[i].id_venta
//                         }`,
//                     );
//                 }
//                 newCurrent -= sales[i].cerdos_vendidos;
//                 console.log("newCurrent if 3", newCurrent);
//             }
//         }
//     }

//     const updatedSalesRow = await updatedSales(
//         sales_id,
//         batch_id,
//         pig_sold,
//         average_weight,
//         price_kg,
//     );
//     if (updatedSalesRow === 0) throw new Error("Error al actualizar la venta");
//     const batchUpdated = await updatedBatch(
//         batch_id,
//         undefined,
//         undefined,
//         undefined,
//         newCurrent,
//     );
//     if (batchUpdated === 0) {
//         throw new Error("Error al actualizar el numero de cerdos en el lote");
//     }

//     return "Venta y numero de cerdos actualizados exitosamente";
// };
