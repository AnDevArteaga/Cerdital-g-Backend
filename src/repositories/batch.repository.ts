import pool from "../config/db";

//Obtener un lote en especifico
export const getOneBatchById = async (batch_id: number) =>  {
    const { rows } = await pool.query(
        "SELECT * FROM lotes WHERE id_lote = $1",
        [batch_id],
    );
    return rows
}; 

//Obtener lotes por id de usuario
export const getBatchById = async (user_id: number) => {
    const { rows } = await pool.query(
        "SELECT * FROM lotes WHERE id_usuario = $1",
        [user_id],
    );
    return rows;
};

//Crear lote de un usuario
export const createBatch = async (
    user_id: number,
    batch_name: string,
    pig_registered: number,
    current_pig: number,
    race: string,
    average_weight: number,
    phase: number,
) => {
    const date = new Date();
    const { rows } = await pool.query(
        "INSERT INTO lotes (id_usuario, nombre_lote, numero_cerdos_registrado, numeros_cerdos_actuales, raza, peso_promedio, fecha_creacion, fase) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning id_lote",
        [
            user_id,
            batch_name,
            pig_registered,
            current_pig,
            race,
            average_weight,
            date,
            phase
        ],
    );
    return rows[0];
};

//elminar lote por id de lote
export const deleteBatch = async (batch_id: number) => {
    const { rowCount } = await pool.query(
        "DELETE FROM lotes WHERE id_lote = $1",
        [batch_id],
    );
    return rowCount;
};

//editar lote por id de lote
//Prueba de consulta dinámica para evaluar rendimiento y recursos
//Se edita solo el o los campo recibidos
export const updatedBatch = async (
    batch_id: number,   
    race?: string,
    average_weight?: number,
    number_of_pigs?: number,
    newCurrent?: number,
    mortality?: number,
    phase?: number,
    status?: boolean
   
) => {

    console.log(number_of_pigs, newCurrent);
    const fields: string[] = [];
    const values: any[] = [];

    if (race !== undefined) {
        fields.push("raza = $"+(fields.length+1));
        values.push(race);
    }
    if (average_weight !== undefined) {
        fields.push("peso_promedio = $"+(fields.length+1));
        values.push(average_weight);
    }
    if (number_of_pigs !== undefined) {
        fields.push("numero_cerdos_registrado = $"+(fields.length+1));
        values.push(number_of_pigs);
    }
    if (newCurrent !== undefined) {
        fields.push("numeros_cerdos_actuales = $"+(fields.length+1));
        values.push(newCurrent);
    }
    
    if (mortality !== undefined) {
        fields.push("mortalidad = $"+(fields.length+1));
        values.push(mortality);
    }
    if (phase !== undefined) {
        fields.push("fase = $"+(fields.length+1));
        values.push(phase);
    }
    if (status !== undefined) {
        fields.push("activo = $"+(fields.length+1));
        values.push(status);
    }



    // Si no hay campos que actualizar, salir
    if (fields.length === 0) {
        return 0;
    }
  
    values.push(batch_id);
    const query = `UPDATE lotes SET ${fields.join(", ")} WHERE id_lote = $${values.length} RETURNING numeros_cerdos_actuales`;

    const { rowCount, rows } = await pool.query(query, values);
    console.log('rowCount', rowCount)
    console.log('rows', rows)
    const current_pig_in_db = rows[0].numeros_cerdos_actuales;
    console.log('current_pig', current_pig_in_db)

    return { rowCount, current_pig_in_db };
};
