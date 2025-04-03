import { Request } from "express";
import { SalesResponse } from "../interfaces/finance.interface";

export const salesFormatter = (data: any[]): SalesResponse => ({
    sales: data,
    meta: {
        status: 200,
        message: "ventas encontrada en cache",
    },
});
export const salesCacheKeyBuilder = (req: Request) => `sales:${req.params.user_id}`;