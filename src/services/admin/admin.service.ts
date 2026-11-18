import { userRegister } from "../auth/auth.service";
import { farmDetail, listFarms, phaseTotals, salesByMonth } from "../../repositories/admin.repository";

export async function adminOverview() {
    const granjas = await listFarms();
    const [lotesPorFase, ventasPorMes] = await Promise.all([phaseTotals(), salesByMonth()]);
    const totales = granjas.reduce(
        (sum, farm) => {
            sum.lotesActivos += farm.lotesActivos;
            sum.cerdos += farm.cerdos;
            sum.costos += farm.costos;
            sum.ventas += farm.ventas;
            sum.utilidad += farm.utilidad;
            return sum;
        },
        { lotesActivos: 0, cerdos: 0, costos: 0, ventas: 0, utilidad: 0 },
    );
    return {
        usuarios: granjas.length,
        ...totales,
        lotesPorFase,
        utilidadPorUsuario: granjas.map((farm) => ({
            nombre: farm.nombre,
            utilidad: farm.utilidad,
        })),
        ventasPorMes,
        granjas,
    };
}

export async function adminUser(userId: number) {
    const detail = await farmDetail(userId);
    if (!detail) throw new Error("No existe el usuario");
    return detail;
}

export async function adminCreateUser(
    fullName: string,
    phone: string,
    email: string,
    password: string,
) {
    return userRegister(fullName, phone, email, password);
}
