import { Request, Response } from "express";
import {
    getFeedingByIdUser, createFeedingUser, editFeedingUser
} from "../../services/feeding/feeding.service";

import { FeedingResponse } from "../../interfaces/feeding.interface";
import { Meta } from "../../interfaces/meta.interface";
import { clearCache } from "../../middleware/cache.middleware";
import redis from "../../config/redis";

export const getFeedingById = async (req: Request, res: Response) => {
    const { user_id } = req.params;
    try {
        const data = await getFeedingByIdUser(Number(user_id));

         // Guardar en caché por 1 hora (3600 segundos)
        const redisResponse = await redis.set(`feeding:${user_id}`, JSON.stringify(data), "EX", 3600);
        console.log(redisResponse);
        const response: FeedingResponse = {
            feeding: data,
            meta: {
                status: 200,
                message: "Alimentación encontrada",
            },
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

export const createFeeding = async (req: Request, res: Response) => {
    const { batch_id, feeding_type, feeding_mark, amount, cost, user_id } = req.body;
    try {
        const data = await createFeedingUser(batch_id, feeding_type, feeding_mark, amount, cost, user_id);

        await clearCache(`feeding:${user_id}`);
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

export const editFeeding = async (req: Request, res: Response) => {
    const {user_id, batch_id, feeding_type, feeding_mark, amount, cost } = req.body;
    const { feeding_id } = req.params;
    try {
        const data = await editFeedingUser(Number(feeding_id), batch_id, feeding_type, feeding_mark, amount, cost);
        
        await clearCache(`feeding:${user_id}`);
        
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