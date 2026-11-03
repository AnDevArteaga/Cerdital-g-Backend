import { Request, Response } from "express";
import { getAgendaByUserId, createAgendaUser } from "../../services/agenda/agenda.service";
import { AgendaResponse } from "../../interfaces/agenda.interface";
import { Meta } from "../../interfaces/meta.interface";
import { fail } from "../../errors";

export const getAgenda = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    try {
        const agenda = await getAgendaByUserId(userId);
        const response: AgendaResponse = {
            agenda: agenda,
            meta: {
                status: 200,
                message: "Agenda encontrada",
            },
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 404);
    }
};

export const createAgenda = async (req: Request, res: Response) => {
    const userId = Number(req.user.userId);
    const { title, description, event_date } = req.body;
    try {
        const agenda = await createAgendaUser(userId, title, description, event_date);
        console.log('agenda', agenda)
        const response: Meta = {
            status: 200,
            message: agenda,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};