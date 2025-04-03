import { Request, Response } from "express";
import { getDiseaseListUser } from "../../services/lists/healtList.service";
import { DiseaseResponse } from "../../interfaces/list.interface";
import { Meta } from "../../interfaces/meta.interface";

export const getDiseaseList = async (req: Request, res: Response) => {
    try {
        const data = await getDiseaseListUser();
        const response: DiseaseResponse = {
            disease: data,
            meta: {
                status: 200,
                message: "Enfermedades encontradas",
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