import { Request, Response } from "express";
import { getRaceListUser, getRaceTypeListUser } from "../../services/lists/raceList.service";
import { RaceResponse, RaceTypeResponse } from "../../interfaces/list.interface"
import { Meta } from "../../interfaces/meta.interface";


export const getRaceTypeList = async (req: Request, res: Response) => {
    try {
        const data = await getRaceTypeListUser();
        const response: RaceTypeResponse = {
            raceType: data,
            meta: {
                status: 200,
                message: "Tipos de Razas encontradas",
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


export const getRaceList = async (req: Request, res: Response) => {
    const { race_type_id } = req.params;
    try {
        const data = await getRaceListUser(Number(race_type_id));
        const response: RaceResponse = {
            race: data,
            meta: {
                status: 200,
                message: "Razas encontradas",
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