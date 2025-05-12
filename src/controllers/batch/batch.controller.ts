import { Request, Response } from "express";
import {
    createBatchUser, getBatchByIdUser, editBatchUser,
} from "../../services/batch/batch.service";

import { BatchResponse } from "../../interfaces/batch.interface";
import { Meta } from "../../interfaces/meta.interface";
import { clearCache } from "../../middleware/cache.middleware";
import redis from "../../config/redis";

export const getBatchById = async (req: Request, res: Response) => {
    const { user_id } = req.params;
    try {
        const data = await getBatchByIdUser(Number(user_id));
        console.log('data', data)
         // Guardar en caché por 1 hora (3600 segundos)
        if (data.length > 0) {
            const redisResponse = await redis.set(`batch:${user_id}`, JSON.stringify(data), "EX", 3600);
            console.log(redisResponse);
        }
        const response: BatchResponse = {
            batch: data,
            meta: {
                status: 200,
                message: data.length > 1 ? "Lote encontrado": "No has creado ningún lote",
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

export const createBatch = async (req: Request, res: Response) => {
    const { user_id, batch_name, pigs, race, average_weight, phase } = req.body;
    try {
        const data = await createBatchUser(user_id, batch_name, pigs, race, average_weight, phase);

        await clearCache(`batch:${user_id}`);
        await clearCache(`home:${user_id}`);

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

export const editBatch = async (req: Request, res: Response) => {
    const { user_id, race, average_weight, number_of_pigs, pig_registered, current_pig } = req.body;
    const { batch_id } = req.params;
    try {
        const data = await editBatchUser(Number(batch_id), race, average_weight, number_of_pigs, pig_registered, current_pig);

        await clearCache(`batch:${user_id}`);
        await clearCache(`home:${user_id}`);
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