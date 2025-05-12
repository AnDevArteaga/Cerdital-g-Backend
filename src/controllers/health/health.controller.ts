import { Request, Response } from "express";
import { getHealthByIdUser, createHealthUser, editHealthUser, deleteHealthUser } from "../../services/health/health.service";

import { HealthResponse } from "../../interfaces/health.interface";
import { Meta } from "../../interfaces/meta.interface";
import { clearCache } from "../../middleware/cache.middleware";
import redis from "../../config/redis";

export const getHealthById = async (req: Request, res: Response) => {
    const { user_id } = req.params;
    console.log(req);
    // const userId = req.user?.userId;
    // console.log(userId);
    // if (!userId) throw new Error("Sin usuario");
    try {
        const data = await getHealthByIdUser(Number(user_id));
        
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
    } catch (error: any) {
        const response: Meta = {
            status: 404,
            message: error.message,
        };
        res.status(404).json(response);
    }
};

export const createHealth = async (req: Request, res: Response) => {
    const { batch_id, disease, treatment, user_id } = req.body;
    try {
        const data = await createHealthUser(batch_id, disease, treatment, user_id);

        // await clearCache(`health:${user_id}`);
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

export const deleteHealth = async (req: Request, res: Response) => {
    const { health_id } = req.params;
    try {
        // await clearCache(`health:${user_id}`);

        const data = await deleteHealthUser(Number(health_id));
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

export const editHealth = async (req: Request, res: Response) => {
    const { health_id } = req.params;
    const { batch_id, disease, treatment } = req.body;
    try {
        const data = await editHealthUser(Number(health_id), batch_id, disease, treatment);
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