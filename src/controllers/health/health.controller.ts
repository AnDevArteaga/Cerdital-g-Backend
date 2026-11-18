import { Request, Response } from "express";
import { getHealthByIdUser, createHealthUser, editHealthUser, deleteHealthUser } from "../../services/health/health.service";

import { HealthResponse } from "../../interfaces/health.interface";
import { Meta } from "../../interfaces/meta.interface";
import { clearCache } from "../../middleware/cache.middleware";
import redis from "../../config/redis";
import { fail } from "../../errors";
import { optionalClientId } from "../../repositories/client.repository";

export const getHealthById = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    try {
        const data = await getHealthByIdUser(userId);
        
         // Guardar en caché por 1 hora (3600 segundos)
        // const redisResponse = await redis.set(`health:${user_id}`, JSON.stringify(data), "EX", 3600);
        // console.log(redisResponse);
        const response: HealthResponse = {
            health: data,
            meta: {
                status: 200,
                message: "Salud encontrada",
            },
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 404);
    }
};

export const createHealth = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    const { batch_id, disease, treatment, client_id } = req.body;
    try {
        const data = await createHealthUser(
            batch_id,
            disease,
            treatment,
            userId,
            optionalClientId(client_id),
        );

        res.status(200).json({
            status: 200,
            message: data.message,
            record: data.record,
        });
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};

export const deleteHealth = async (req: Request, res: Response) => {
    const { health_id } = req.params;
    try {
        const data = await deleteHealthUser(Number(health_id), Number(req.user.userId));
        const response: Meta = {
            status: 200,
            message: data,
            };

        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};

export const editHealth = async (req: Request, res: Response) => {
    const { health_id } = req.params;
    const { batch_id, disease, treatment } = req.body;
    try {
        const data = await editHealthUser(Number(health_id), batch_id, disease, treatment, Number(req.user.userId));
        const response: Meta = {
            status: 200,
            message: data,
            };

        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};