import { Request, Response } from "express";
import {
    getFeedingByIdUser, createFeedingUser, editFeedingUser
} from "../../services/feeding/feeding.service";

import { FeedingResponse } from "../../interfaces/feeding.interface";
import { Meta } from "../../interfaces/meta.interface";
import { clearCache } from "../../middleware/cache.middleware";
import redis from "../../config/redis";
import { fail } from "../../errors";
import { optionalClientId } from "../../repositories/client.repository";

export const getFeedingById = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    try {
        const data = await getFeedingByIdUser(userId);

         // Guardar en caché por 1 hora (3600 segundos)
        const redisResponse = await redis.set(`feeding:${userId}`, JSON.stringify(data), "EX", 3600);
        console.log(redisResponse);
        const response: FeedingResponse = {
            feeding: data,
            meta: {
                status: 200,
                message: "Alimentación encontrada",
            },
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 404);
    }
};

export const createFeeding = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    const { batch_id, feeding_type, feeding_mark, amount, cost, client_id } = req.body;
    try {
        const data = await createFeedingUser(
            batch_id,
            feeding_type,
            feeding_mark,
            amount,
            cost,
            userId,
            optionalClientId(client_id),
        );

        await clearCache(`feeding:${userId}`);
        res.status(200).json({
            status: 200,
            message: data.message,
            record: data.record,
        });
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};

export const editFeeding = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    const { batch_id, feeding_type, feeding_mark, amount, cost } = req.body;
    const { feeding_id } = req.params;
    try {
        const data = await editFeedingUser(Number(feeding_id), batch_id, feeding_type, feeding_mark, amount, cost, userId);
        
        await clearCache(`feeding:${userId}`);
        
        const response: Meta = {
            status: 200,
            message: data,
            };

        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};