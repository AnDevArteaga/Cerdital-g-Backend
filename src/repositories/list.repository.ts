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

//Obtener raza por nomnre
export const getRaceByName = async (name: string) => {
    console.log('name', name)
    const { rows } = await pool.query(
        "SELECT * FROM raza WHERE nombre_raza = $1",
        [name],
    );
    return rows[0] || [];
};

//Obtener un tipo de raza por id
export const getRaceById = async (id: number) => {
    console.log('id', id)
    const { rows } = await pool.query(
        "SELECT tipo_raza FROM tipo_raza WHERE id = $1",
        [id],
    );
    return rows[0] || [];
};

export const getPhaseList = async () => {
    const { rows } = await pool.query(
        "SELECT * FROM fases",
    );  
    return rows;
};

export const getPhaseById = async (phase_id: number) => {
    const { rows } = await pool.query(
        "SELECT * FROM fases WHERE id_fase = $1",
        [phase_id],
    );
    return rows;
};

export const getPhaseByName = async (name: string) => {
    const { rows } = await pool.query(
        "SELECT * FROM fases WHERE nombre_fase = $1",
        [name],
    );
    return rows;
};