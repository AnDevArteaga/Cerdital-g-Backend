import { Request, Response } from "express";
import { getDataHome } from "../../services/home/home.service";
import { HomeResponse } from "../../interfaces/home.interface";
import { Meta } from "../../interfaces/meta.interface";

import redis from "../../config/redis";

export const getDataHomeController = async (req: Request, res: Response) => {
    const { user_id } = req.params;
    try {
        const data = await getDataHome(Number(user_id));
        // Guardar en caché por 1 hora (3600 segundos)
        const redisResponse = await redis.set(`home:${user_id}`, JSON.stringify(data), "EX", 3600);
        console.log(redisResponse);
        const meta: Meta = {
            status: 200,
            message: "Datos de inicio",
        };
        const response = {
            ...data, meta
        }
        res.status(200).json(response);
    } catch (error: any) {
        const response: Meta = {
            status: 404,
            message: error.message,
        };
        res.status(404).json(response);
    }
};
