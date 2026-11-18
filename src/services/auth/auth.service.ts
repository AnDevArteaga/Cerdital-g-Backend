import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    changePassword,
    createUser,
    findUserByEmail,
    setRole,
    updateToken,
    deleteToken
} from "../../repositories/user.repository";
import { ForbiddenError } from "../../errors";


//Registro de usuario
export const userRegister = async (
    fullName: string,
    phone: string,
    email: string,
    password: string,
) => {
    if (password.length < 5) {
        throw new Error("La contraseña debe tener al menos 5 caracteres");
    }
    if (email.length < 5) throw new Error("Email Inválido");
    if (phone.length < 10) throw new Error("Telefono inválido");
    if (!fullName) throw new Error("Nombres inválidos");

    const user = await findUserByEmail(email);
    if (user) throw new Error("El correo electrónico ya está registrado");

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCreated = await createUser(
        fullName,
        phone,
        email,
        hashedPassword,
    );

    return userCreated;
};

//Inicio de sesión
export const userLogin = async (
    email: string,
    password: string,
    token: string,
) => {
    const user = await findUserByEmail(email);
    if (!user) throw new Error("El correo electrónico no existe");

    const isPasswordCorrect = await bcrypt.compare(password, user.contrasena);
    if (!isPasswordCorrect) throw new Error("Contraseña incorrecta");

    const updatedToken = await updateToken(user.id_usuario, token || "");
    if (updatedToken === 0) throw new Error("Error al actualizar el token");
    const userId = user.id_usuario;
    const rol = user.rol === "superadmin" ? "superadmin" : "usuario";
    const AuthToken = jwt.sign(
        { userId, rol },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" },
    );
    const response = {
        id: user.id_usuario,
        email: user.correo,
        fullName: user.nombre,
        phone: user.telefono,
        rol,
        token: AuthToken,
    };
    return response;
};

export const ensureSuperAdmin = async () => {
    const email = process.env.SUPERADMIN_EMAIL?.trim();
    const password = process.env.SUPERADMIN_PASSWORD || "";
    const fullName = process.env.SUPERADMIN_NAME?.trim() || "Cerdital";
    if (!email || password.length < 5) return;

    const existing = await findUserByEmail(email);
    if (existing) {
        if (existing.rol !== "superadmin") await setRole(existing.id_usuario, "superadmin");
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser(fullName, "3000000000", email, hashedPassword, "superadmin");
};

//Verificar usuario si existe
export const checkUserByEmail = async (email: string) => {
    const user = await findUserByEmail(email);
    if (!user) throw new Error("El correo electrónico no existe");

    return "Usuario encontrado";
};


//Cambiar contraseña con el correo
export const changePasswordByEmail = async (
    email: string,
    password: string,
    actorId: number,
) => {
    if (!password || password.length < 5) {
        throw new Error("La contraseña debe tener al menos 5 caracteres");
    }
    const user = await findUserByEmail(email);
    if (!user) throw new Error("El correo electrónico no existe");
    if (Number(user.id_usuario) !== Number(actorId)) throw new ForbiddenError();

    const hashedPassword = await bcrypt.hash(password, 10);
    const userUpdated = await changePassword(email, hashedPassword);
    if (!userUpdated) throw new Error("Error al cambiar la contraseña");
    return "Contraseña cambiada exitosamente";
};


//Cerrar Sesión
export const deleteUserToken = async (id: string) => {
    const deletedToken = await deleteToken(id)
    if (deletedToken === 0) throw new Error("Error al eliminar el token")
    return "Sesión Cerrada exitosamente"
    }

