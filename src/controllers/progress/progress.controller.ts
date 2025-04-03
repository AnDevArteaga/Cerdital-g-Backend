import { Request, Response } from "express";
import {
    getProgressByIdUser,
    updateProgressUser,
    createProgressUser
} from "../../services/progress/progress.service";

import { Progress } from "../../interfaces/progress.interface";
import { Meta } from "../../interfaces/meta.interface";
import { clearCache } from "../../middleware/cache.middleware";

export const getProgressById = async (req: Request, res: Response) => {
    const { user_id } = req.params;
    try {
        const data = await getProgressByIdUser(Number(user_id));
        console.log('list progress', data);
        const meta: Meta = {
            status: 200,
            message: "Progresos encontrados",
        };
        const response = {
            ...data, meta
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

export const createProgress = async (req: Request, res: Response) => {
    const { batch_id, date_weight, weekly_average_weight, mortality, phase, user_id } = req.body;
    try {
        const data = await createProgressUser(batch_id, date_weight, weekly_average_weight, mortality, phase, user_id);
        await clearCache(`batch:${user_id}`);

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

export const updateProgress = async (req: Request, res: Response) => {
    const { progress_id } = req.params;
    const { batch_id, date_weight, weekly_average_weight, mortality, phase, user_id } = req.body;
    try {
        const data = await updateProgressUser( Number(progress_id),batch_id, date_weight, weekly_average_weight, mortality, phase);
        await clearCache(`batch:${user_id}`);
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