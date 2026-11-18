import pool from "../config/db";

const money = (value: unknown) => Number(value || 0);

export async function listFarms() {
    const { rows } = await pool.query(`
        WITH costos_usuario AS (
            SELECT id_usuario,
                SUM(compra_cerdos + alimentacion + medicamentos + mano_obra + transporte + otros) AS total
            FROM costos
            WHERE deleted_at IS NULL
            GROUP BY id_usuario
        ),
        ventas_usuario AS (
            SELECT id_usuario,
                SUM(cerdos_vendidos * peso_promedio * precio_kg) AS total
            FROM ventas
            WHERE deleted_at IS NULL
            GROUP BY id_usuario
        ),
        lotes_usuario AS (
            SELECT id_usuario,
                COUNT(*) FILTER (WHERE activo) AS lotes_activos,
                COALESCE(SUM(numeros_cerdos_actuales) FILTER (WHERE activo), 0) AS cerdos
            FROM lotes
            WHERE deleted_at IS NULL
            GROUP BY id_usuario
        )
        SELECT u.id_usuario AS id,
            u.nombre,
            u.correo,
            u.telefono,
            u.rol,
            COALESCE(l.lotes_activos, 0) AS lotes_activos,
            COALESCE(l.cerdos, 0) AS cerdos,
            COALESCE(c.total, 0) AS costos,
            COALESCE(v.total, 0) AS ventas,
            COALESCE(v.total, 0) - COALESCE(c.total, 0) AS utilidad
        FROM usuarios u
        LEFT JOIN lotes_usuario l ON l.id_usuario = u.id_usuario
        LEFT JOIN costos_usuario c ON c.id_usuario = u.id_usuario
        LEFT JOIN ventas_usuario v ON v.id_usuario = u.id_usuario
        WHERE u.rol = 'usuario'
        ORDER BY utilidad DESC, u.nombre ASC
    `);
    return rows.map(presentFarm);
}

export async function phaseTotals() {
    const { rows } = await pool.query(`
        SELECT f.nombre_fase AS fase, COUNT(*)::int AS lotes
        FROM lotes l
        JOIN fases f ON f.id_fase = l.fase
        WHERE l.deleted_at IS NULL AND l.activo = TRUE
        GROUP BY f.nombre_fase, f.id_fase
        ORDER BY f.id_fase
    `);
    return rows.map((row) => ({ fase: row.fase as string, lotes: Number(row.lotes) }));
}

export async function salesByMonth() {
    const { rows } = await pool.query(`
        SELECT to_char(fecha_creacion, 'YYYY-MM') AS mes,
            SUM(cerdos_vendidos * peso_promedio * precio_kg) AS total
        FROM ventas
        WHERE deleted_at IS NULL
        GROUP BY 1
        ORDER BY 1
    `);
    return rows.map((row) => ({ mes: row.mes as string, total: money(row.total) }));
}

export async function farmDetail(userId: number) {
    const user = await pool.query(
        `SELECT id_usuario AS id, nombre, correo, telefono, rol
         FROM usuarios WHERE id_usuario = $1`,
        [userId],
    );
    if (!user.rows[0]) return null;

    const [lotes, alimentacion, sanidad, costos, ventas, progreso, agenda, fases] = await Promise.all([
        pool.query(
            `SELECT l.id_lote, l.nombre_lote, l.numero_cerdos_registrado, l.numeros_cerdos_actuales,
                    l.raza, l.peso_promedio, l.mortalidad, l.activo, l.fecha_creacion, f.nombre_fase
             FROM lotes l
             JOIN fases f ON f.id_fase = l.fase
             WHERE l.id_usuario = $1 AND l.deleted_at IS NULL
             ORDER BY l.fecha_creacion DESC`,
            [userId],
        ),
        pool.query(
            `SELECT a.id_alimentacion, a.tipo_alimento, a.marca_alimento, a.cantidad_kg,
                    a.costo_unitario, a.fecha_creacion, l.nombre_lote
             FROM alimentacion a
             JOIN lotes l ON l.id_lote = a.id_lote
             WHERE a.id_usuario = $1 AND a.deleted_at IS NULL
             ORDER BY a.fecha_creacion DESC`,
            [userId],
        ),
        pool.query(
            `SELECT s.id_tratamiento, s.enfermedad, s.tratamiento, s.fecha_creacion, l.nombre_lote
             FROM salud_tratamiento s
             JOIN lotes l ON l.id_lote = s.id_lote
             WHERE s.id_usuario = $1 AND s.deleted_at IS NULL
             ORDER BY s.fecha_creacion DESC`,
            [userId],
        ),
        pool.query(
            `SELECT c.id_costo, c.compra_cerdos, c.alimentacion, c.medicamentos, c.mano_obra,
                    c.transporte, c.otros, c.fecha_creacion, l.nombre_lote
             FROM costos c
             JOIN lotes l ON l.id_lote = c.id_lote
             WHERE c.id_usuario = $1 AND c.deleted_at IS NULL
             ORDER BY c.fecha_creacion DESC`,
            [userId],
        ),
        pool.query(
            `SELECT v.id_venta, v.cerdos_vendidos, v.peso_promedio, v.precio_kg, v.fecha_creacion, l.nombre_lote
             FROM ventas v
             JOIN lotes l ON l.id_lote = v.id_lote
             WHERE v.id_usuario = $1 AND v.deleted_at IS NULL
             ORDER BY v.fecha_creacion DESC`,
            [userId],
        ),
        pool.query(
            `SELECT p.id_progreso, p.fecha_pesaje, p.record_peso_promedio, p.mortalidad,
                    f.nombre_fase, l.nombre_lote
             FROM progreso p
             JOIN lotes l ON l.id_lote = p.id_lote
             JOIN fases f ON f.id_fase = p.fase
             WHERE p.id_usuario = $1 AND p.deleted_at IS NULL
             ORDER BY p.fecha_pesaje DESC`,
            [userId],
        ),
        pool.query(
            `SELECT id_agenda, titulo, descripcion, fecha_evento
             FROM agenda
             WHERE id_usuario = $1 AND deleted_at IS NULL
             ORDER BY fecha_evento ASC`,
            [userId],
        ),
        pool.query(
            `SELECT f.nombre_fase AS fase, COUNT(*)::int AS lotes
             FROM lotes l
             JOIN fases f ON f.id_fase = l.fase
             WHERE l.id_usuario = $1 AND l.deleted_at IS NULL AND l.activo = TRUE
             GROUP BY f.nombre_fase, f.id_fase
             ORDER BY f.id_fase`,
            [userId],
        ),
    ]);

    const farm = (await listFarms()).find((item) => item.id === userId);
    return {
        usuario: user.rows[0],
        resumen: farm ?? {
            id: userId,
            nombre: user.rows[0].nombre,
            correo: user.rows[0].correo,
            telefono: user.rows[0].telefono,
            rol: user.rows[0].rol,
            lotesActivos: 0,
            cerdos: 0,
            costos: 0,
            ventas: 0,
            utilidad: 0,
        },
        lotesPorFase: fases.rows.map((row) => ({ fase: row.fase as string, lotes: Number(row.lotes) })),
        lotes: lotes.rows,
        alimentacion: alimentacion.rows,
        sanidad: sanidad.rows,
        costos: costos.rows,
        ventas: ventas.rows.map((row) => ({
            ...row,
            valor: money(row.cerdos_vendidos) * money(row.peso_promedio) * money(row.precio_kg),
        })),
        progreso: progreso.rows,
        agenda: agenda.rows,
    };
}

function presentFarm(row: Record<string, unknown>) {
    return {
        id: Number(row.id),
        nombre: String(row.nombre),
        correo: String(row.correo),
        telefono: String(row.telefono),
        rol: String(row.rol),
        lotesActivos: Number(row.lotes_activos),
        cerdos: Number(row.cerdos),
        costos: money(row.costos),
        ventas: money(row.ventas),
        utilidad: money(row.utilidad),
    };
}
