import { Request, Response } from "express";
import {
    editCostUser,
    getCostByIdUser,
} from "../../services/finance/cost.service";

import { CostResponse } from "../../interfaces/finance.interface";
import { Meta } from "../../interfaces/meta.interface";
import { clearCache } from "../../middleware/cache.middleware";
import { fail } from "../../errors";

export const getCostById = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    try {
        const data = await getCostByIdUser(userId);
        const response: CostResponse = {
            cost: data,
            meta: {
                status: 200,
                message: "Costo encontrado",
            },
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 404);
    }
};

export const editCost = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    const { cost_id } = req.params;
    const {
        batch_id,
        purchase_pigs,
        feeding,
        medicine,
        handwork,
        transport,
        other,
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
            userId,
        );
        await clearCache(`home:${userId}`);
        const response: Meta = {
            status: 201,
            message: data,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};
