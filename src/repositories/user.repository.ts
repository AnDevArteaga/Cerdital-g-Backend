import pool from "../config/db";


//Buscar usuario por correo
export const findUserByEmail = async (email: string) => {
    const { rows } = await pool.query(
        "SELECT * FROM usuarios WHERE correo = $1",
        [email],
    );
    return rows[0];
}

export const findUserById = async (id: number) => {
    const { rows } = await pool.query(
        "SELECT * FROM usuarios WHERE id_usuario = $1",
        [id],
    );
    return rows[0];
}

//Cambiar contraseña
export const changePassword = async (email: string, password: string) => {
    const { rowCount }  = await pool.query (
        "UPDATE usuarios SET contrasena = $1 WHERE correo = $2", [password, email]
        );
    return rowCount;
};

//Crear usuario
export const createUser = async (
    fullName: string,
    phone: string,
    email: string,
    password: string,
    rol: "usuario" | "superadmin" = "usuario",
) => {
    const { rows } = await pool.query(
        "INSERT INTO usuarios (nombre, telefono, correo, contrasena, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario, correo, rol",
        [fullName, phone, email, password, rol],
    );
    return rows[0];
};

export const setRole = async (id: number, rol: "usuario" | "superadmin") => {
    const { rowCount } = await pool.query(
        "UPDATE usuarios SET rol = $1 WHERE id_usuario = $2",
        [rol, id],
    );
    return rowCount;
};

//Actualizar token de firebase en la base de datos
export const updateToken = async (id: number, token: string) => {
    const { rowCount } = await pool.query(
        "UPDATE usuarios SET token = $1 WHERE id_usuario = $2",
        [token, id],
    );

    return rowCount;
};

//Eliminar token de firebase en la base de datos
export const deleteToken = async (id: string) => {
    console.log(id)
    const { rowCount } = await pool.query(
        "UPDATE usuarios SET token = NULL WHERE id_usuario = $1",
        [id],
    );

    return rowCount;
};
