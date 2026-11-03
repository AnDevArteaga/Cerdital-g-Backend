import { Request, Response } from "express";
import { getDataHome } from "../../services/home/home.service";
import { HomeResponse } from "../../interfaces/home.interface";
import { Meta } from "../../interfaces/meta.interface";

import redis from "../../config/redis";
import { fail } from "../../errors";

export const getDataHomeController = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    try {
        const data = await getDataHome(userId);
        const redisResponse = await redis.set(`home:${userId}`, JSON.stringify(data), "EX", 3600);
        console.log(redisResponse);
        const meta: Meta = {
            status: 200,
            message: "Datos de inicio",
        };
        const response = {
            ...data, meta
        }
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 404);
    }
};
