import { Request } from "express";
import { HealthResponse } from "../interfaces/health.interface";

export const healthFormatter = (data: any[]): HealthResponse => ({
    health: data,
    meta: {
        status: 200,
        message: "salud encontrada en cache",
    },
});
export const healthCacheKeyBuilder = (req: Request) => `health:${req.params.user_id}`;