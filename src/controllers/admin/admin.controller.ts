import { Request, Response } from "express";
import { fail } from "../../errors";
import { adminCreateUser, adminOverview, adminUser } from "../../services/admin/admin.service";

export const getOverview = async (_req: Request, res: Response) => {
    try {
        const data = await adminOverview();
        res.status(200).json(data);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const data = await adminUser(Number(req.params.id));
        res.status(200).json(data);
    } catch (error: unknown) {
        fail(res, error, 404);
    }
};

export const postUser = async (req: Request, res: Response) => {
    const { fullName, phone, email, password } = req.body;
    try {
        const user = await adminCreateUser(fullName, phone, email, password);
        res.status(201).json({
            status: 201,
            message: "Granja creada",
            user,
        });
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};
