import pool from "../config/db"

//Obtener listas seleccionables de tipo de alimentacion
export const getFeedingTypeList = async () => {
    const { rows } = await pool.query(
        "SELECT * FROM tipo_alimento",
    );
    return rows;
};

//Obtener lista de marcas de alimentacion por tipo de alimentacion
export const getFeedingMarkList = async (feeding_type_id: number) => {
    const { rows } = await pool.query(
        "SELECT id, nombre_marca FROM marca_alimento WHERE id_tipo_alimento = $1",
        [feeding_type_id],
    );
    return rows;
};

//Obtener lista de enfermedades
export const getDiseaseList = async () => {
    const { rows } = await pool.query(
        "SELECT * FROM enfermedades",
    );
    return rows;
};

//Obtener lista de razas
export const getRaceTypeList = async () => {
    const { rows } = await pool.query(
        "SELECT * FROM tipo_raza",
    );
    return rows;
};

//Obtener lista de razas
export const getRaceList = async (race_type_id: number) => {
    const { rows } = await pool.query(
        "SELECT id, nombre_raza FROM raza WHERE id_tipo_raza = $1",
        [race_type_id],
    );
    return rows;
};