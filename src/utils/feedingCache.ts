import { Request } from "express";
import { FeedingResponse } from "../interfaces/feeding.interface";

export const feedingFormatter = (data: any[]): FeedingResponse => ({
    feeding: data,
    meta: {
        status: 200,
        message: "alimentación encontrada en cache",
    },
});
export const feedingCacheKeyBuilder = (req: Request) => `feeding:${req.params.user_id}`;