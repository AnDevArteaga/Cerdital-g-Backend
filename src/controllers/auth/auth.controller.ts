import { Request, Response } from "express";
import {
    changePasswordByEmail,
    checkUserByEmail,
    userLogin,
    userRegister,
    deleteUserToken,
} from "../../services/auth/auth.service";

import { UserResponse } from "../../interfaces/user.interface";
import { Meta } from "../../interfaces/meta.interface";
import { fail } from "../../errors";

export const register = async (req: Request, res: Response) => {
    const { fullName, phone, email, password } = req.body;
    try {
        const user = await userRegister(fullName, phone, email, password);
        const response: UserResponse = {
            user: user,
            meta: {
                status: 200,
                message: "Registro exitoso",
            },
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password, token } = req.body;

    try {
        const data = await userLogin(email, password, token);
        const response: UserResponse = {
            user: data,
            meta: {
                status: 200,
                message: "Inicio de sesión exitoso",
            },
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};

export const checkUser = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const data = await checkUserByEmail(email);
        const response: Meta = {
            status: 200,
            message: data,
        };
        res.status(200).json(response);
    } catch (error: any) {
        const response: Meta = {
            status: 404,
            message: error.message,
        };
        res.status(404).json(response);
    }
};

export const changePassword = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const data = await changePasswordByEmail(email, password, Number(req.user.userId));
        const response: Meta = {
            status: 200,
            message: data,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};

export const logout = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (Number(id) !== Number(req.user.userId)) {
        res.status(403).json({ status: 403, message: "No puedes ver datos de otro usuario." });
        return;
    }
    try {
        const data = await deleteUserToken(id);
        const response: Meta = {
            status: 200,
            message: data,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};
