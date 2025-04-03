import { Request } from "express";
import { BatchResponse } from "../interfaces/batch.interface";

export const batchFormatter = (data: any[]): BatchResponse => ({
    batch: data,
    meta: {
        status: 200,
        message: "Lote encontrado en cache",
    },
});
export const batchCacheKeyBuilder = (req: Request) => `batch:${req.params.user_id}`;