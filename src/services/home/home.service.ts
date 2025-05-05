import { getLotesActive } from "../../repositories/home.repository";
import { getCostById } from "../../repositories/cost.repository";
import { getSalesById } from "../../repositories/sales.repository";
import { getPhaseById } from "../../repositories/list.repository";

export const getDataHome = async (user_id: number) => {
    if (!user_id) throw new Error("Sin ID de usuario");

    const batchs = await getLotesActive(user_id);
    const costs = await getCostById(user_id);
    const sales = await getSalesById(user_id);

    const batchsByPhase = getBatchByPhase(batchs);
    const { totalCosts, totalSales } = calculateTotals(costs, sales);
    const profit = totalSales - totalCosts;
    const batchsActive = batchs.length

        // Reemplazar el ID de fase por el nombre
    const batchByPhaseWithPhaseName = await Promise.all(
        batchsByPhase.map(async (item) => {
                const phaseData = await getPhaseById(Number(item.phase));
                const phase = Array.isArray(phaseData) ? phaseData[0] : phaseData;
    
                return {
                    ...item,
                    phase: phase?.nombre_fase || "Fase desconocida",
                };
            })
        );

    return { batchsActive, totalCosts, totalSales, profit, batchsByPhase:batchByPhaseWithPhaseName }
};



const calculateTotals = (costs: any, sales: any) => {
    if (!costs || !sales) {
        throw new Error("Datos inválidos");
    }

    // Sum costs (excluding id_costo, id_lote, fecha_creacion, id_usuario)
    const totalCosts = costs.reduce((total: any, cost: any) => {
        return total + Object.keys(cost).reduce((sum, key) => {
            if (!["id_costo", "id_lote", "fecha_creacion", "id_usuario"].includes(key)) {
                return sum + cost[key];
            }
            return sum;
        }, 0);
    }, 0);

    // Sum precio_kg from sales
    const totalSales = sales.reduce((total: number, sale: any) => {
        return total + sale.precio_kg;
    }, 0);

    return { totalCosts, totalSales };
};

const getBatchByPhase = (batchs: any) => {
     // Construir el objeto agrupando los lotes por fase
     const lotesPorFase = batchs.reduce((agrupado: Record<string, number>, lote: any) => {
        const fase = lote.fase; // Obtener la fase del lote
        agrupado[fase] = (agrupado[fase] || 0) + 1; 
        return agrupado;
    }, {});
    const batchsByPhase = Object.entries(lotesPorFase).map(([phase, batchs]) => ({ phase, batchs }));

    return batchsByPhase;
};


//Para otra ocasión


// const getBatchByPhase = (batchs: any) => {
//     // Construir el objeto agrupando los lotes por fase
//     const lotesPorFase = batchs.reduce((agrupado: any, lote: any) => {
//        const fase = lote.fase; // Obtener la fase del lote
//        if (!agrupado[fase]) {
//            agrupado[fase] = []; // Inicializar array si no existe
//        }
//        agrupado[fase].push(`Lote ${lote.id_lote}`); // Agregar el lote
//        return agrupado;
//    }, {});

//    return lotesPorFase;
// };