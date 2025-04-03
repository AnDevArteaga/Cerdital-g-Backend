import { Request, Response } from "express";
import { getFeedingTypeListUser, getFeedingMarkListUser } from "../../services/lists/feedingList.service";
import { Meta } from "../../interfaces/meta.interface";
import { FeedingTypeResponse, FeedingMarkResponse } from "../../interfaces/list.interface";

export const getFeedingTypeList = async (req: Request, res: Response) => {
    try {
        const data = await getFeedingTypeListUser();
        const response: FeedingTypeResponse = {
            feedingType: data,
            meta: {
                status: 200,
                message: "Tipos de alimentacion encontrados",
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

export const getFeedingMarkList = async (req: Request, res: Response) => {
    const { feeding_type_id } = req.params;
    try {
        const data = await getFeedingMarkListUser(Number(feeding_type_id));
        const response: FeedingMarkResponse = {
            feedingMark: data,
            meta: {
                status: 200,
                message: "Marcas de alimentacion encontradas",
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