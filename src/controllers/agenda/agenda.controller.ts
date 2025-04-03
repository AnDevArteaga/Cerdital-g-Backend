import { Request, Response } from "express";
import { getAgendaByUserId, createAgendaUser } from "../../services/agenda/agenda.service";
import { AgendaResponse } from "../../interfaces/agenda.interface";
import { Meta } from "../../interfaces/meta.interface";

export const getAgenda = async (req: Request, res: Response) => {
    const { user_id } = req.params;
    try {
        const agenda = await getAgendaByUserId(Number(user_id));
        const response: AgendaResponse = {
            agenda: agenda,
            meta: {
                status: 200,
                message: "Agenda encontrada",
            },
        };
        res.status(200).json(response);
    } catch (error: any) {
        const response: Meta = {
            status: 404,
            message: error.message,
        };
        res.status(400).json(response);
    }
};

export const createAgenda = async (req: Request, res: Response) => {
    const { user_id, title, description, event_date } = req.body;
    try {
        const agenda = await createAgendaUser(user_id, title, description, event_date);
        console.log('agenda', agenda)
        const response: Meta = {
            status: 200,
            message: agenda,
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