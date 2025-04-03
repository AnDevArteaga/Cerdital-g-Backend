import { Request, Response } from "express";
import {
    editCostUser,
    getCostByIdUser,
} from "../../services/finance/cost.service";

import { CostResponse } from "../../interfaces/finance.interface";
import { Meta } from "../../interfaces/meta.interface";
import { clearCache } from "../../middleware/cache.middleware";

export const getCostById = async (req: Request, res: Response) => {
    const { user_id } = req.params;
    try {
        const data = await getCostByIdUser(Number(user_id));
        const response: CostResponse = {
            cost: data,
            meta: {
                status: 200,
                message: "Costo encontrado",
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

export const editCost = async (req: Request, res: Response) => {
    const { cost_id } = req.params;
    const {
        batch_id,
        purchase_pigs,
        feeding,
        medicine,
        handwork,
        transport,
        other,
        user_id
    } = req.body;
    try {
        const data = await editCostUser(
            Number(cost_id),
            batch_id,
            purchase_pigs,
            feeding,
            medicine,
            handwork,
            transport,
            other,
        );
        await clearCache(`home:${user_id}`);
        const response: Meta = {
            status: 201,
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
