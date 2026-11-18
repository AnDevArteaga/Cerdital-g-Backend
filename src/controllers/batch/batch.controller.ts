import { Request, Response } from "express";
import {
    createBatchUser, getBatchByIdUser, editBatchUser,
} from "../../services/batch/batch.service";

import { BatchResponse } from "../../interfaces/batch.interface";
import { Meta } from "../../interfaces/meta.interface";
import { clearCache } from "../../middleware/cache.middleware";
import redis from "../../config/redis";
import { fail } from "../../errors";
import { optionalClientId } from "../../repositories/client.repository";

export const getBatchById = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    try {
        const data = await getBatchByIdUser(userId);
        console.log('data', data)
         // Guardar en caché por 1 hora (3600 segundos)
        if (data.length > 0) {
            const redisResponse = await redis.set(`batch:${userId}`, JSON.stringify(data), "EX", 3600);
            console.log(redisResponse);
        }
        const response: BatchResponse = {
            batch: data,
            meta: {
                status: 200,
                message: data.length > 0 ? "Lote encontrado": "No has creado ningún lote",
            },
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 404);
    }
};

export const createBatch = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    const { batch_name, pigs, race, average_weight, phase, client_id, cost_client_id } = req.body;
    try {
        const data = await createBatchUser(
            userId,
            batch_name,
            pigs,
            race,
            average_weight,
            phase,
            optionalClientId(client_id),
            optionalClientId(cost_client_id),
        );

        await clearCache(`batch:${userId}`);
        await clearCache(`home:${userId}`);

        res.status(200).json({
            status: 200,
            message: data.message,
            record: data.record,
        });
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};

export const editBatch = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    const { race, average_weight, number_of_pigs, pig_registered, current_pig } = req.body;
    const { batch_id } = req.params;
    try {
        const data = await editBatchUser(Number(batch_id), race, average_weight, number_of_pigs, pig_registered, current_pig, userId);

        await clearCache(`batch:${userId}`);
        await clearCache(`home:${userId}`);
        const response: Meta = {
            status: 200,
            message: data,
            };

        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};