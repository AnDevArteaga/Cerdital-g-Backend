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
    } catch (error: any) {
        const response: Meta = {
            status: 400,
            message: error.message,
        };
        res.status(400).json(response);
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
    } catch (error: any) {
        const response: Meta = {
            status: 400,
            message: error.message,
        };
        res.status(400).json(response);
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
        const data = await changePasswordByEmail(email, password);
        const response: Meta = {
            status: 200,
            message: data,
        };
        res.status(200).json(response);
    } catch (error: any) {
        const response: Meta = {
            status: 400,
            message: error.message,
        };
        res.status(400).json(response);
    }
};

export const logout = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const data = await deleteUserToken(id);
        const response: Meta = {
            status: 200,
            message: data,
        };
        res.status(200).json(response);
    } catch (error: any) {
        const response: Meta = {
            status: 400,
            message: error.message,
        };
        res.status(400).json(response);
    }
};
