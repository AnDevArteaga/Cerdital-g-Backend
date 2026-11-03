import { Request, Response } from "express";
import {
    getProgressByIdUser,
    updateProgressUser,
    createProgressUser
} from "../../services/progress/progress.service";

import { Progress } from "../../interfaces/progress.interface";
import { Meta } from "../../interfaces/meta.interface";
import { clearCache } from "../../middleware/cache.middleware";
import { fail } from "../../errors";

export const getProgressById = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    try {
        const data = await getProgressByIdUser(userId);
        const meta: Meta = {
            status: 200,
            message: "Progresos encontrados",
        };
        const response = {
            ...data, meta
        };

        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 404);
    }
};

export const createProgress = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    const { batch_id, date_weight, weekly_average_weight, mortality, phase } = req.body;
    try {
        const data = await createProgressUser(batch_id, date_weight, weekly_average_weight, mortality, phase, userId);
        await clearCache(`batch:${userId}`);

        const response: Meta = {
            status: 200,
            message: data,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};

export const updateProgress = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    const { progress_id } = req.params;
    const { batch_id, date_weight, weekly_average_weight, mortality, phase } = req.body;
    try {
        const data = await updateProgressUser(Number(progress_id), batch_id, date_weight, weekly_average_weight, mortality, phase, userId);
        await clearCache(`batch:${userId}`);
        const response: Meta = {
            status: 200,
            message: data,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};