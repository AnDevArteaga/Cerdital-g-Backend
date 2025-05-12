import pool from "../config/db";

//Obtener agenda por id de usuario
export const getAgendaById = async (user_id: number) => {
    const { rows } = await pool.query(
        "SELECT * FROM agenda WHERE id_usuario = $1",
        [user_id],
    );
    return rows;
};

export const getAgendasByDate = async (date: Date) => {
    const today = date.toISOString().split("T")[0];
    console.log("date", date);
    console.log("today", today);
    const query = `SELECT * FROM agenda WHERE fecha_evento::date = $1`;
    const values = [today];

    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error("Error al obtener agendas:", error);
        return [];
    }
};

//Crear agenda de un usuario
export const createAgenda = async (
    user_id: number,
    title: string,
    description: string,
    event_date: string,
) => {
    const { rows } = await pool.query(
        "INSERT INTO agenda (id_usuario, titulo, descripcion, fecha_evento) VALUES ($1, $2, $3, $4 )",
        [
            user_id,
            title,
            description,
            event_date,
        ],
    );
    console.log("rows", rows);
    return rows[0];
};

export const updateAgenda = async (
    agenda_id: number,
) => {
    const { rowCount } = await pool.query(
        "UPDATE agenda SET estado = $1 WHERE id_agenda = $2",
        [
            false,
            agenda_id,
        ],
    );
    return rowCount;
};
