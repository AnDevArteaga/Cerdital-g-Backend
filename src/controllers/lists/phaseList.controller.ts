import { Request, Response } from "express";
import { getPhaseListUser } from "../../services/lists/phaseList.service";
import { PhaseResponse } from "../../interfaces/list.interface";
import { Meta } from "../../interfaces/meta.interface";

export const getPhaseList = async (req: Request, res: Response) => {
    try {
        const data = await getPhaseListUser();
        const response: PhaseResponse = {
            phaseList: data,
            meta: {
                status: 200,
                message: "Lista de fases encontrada",
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