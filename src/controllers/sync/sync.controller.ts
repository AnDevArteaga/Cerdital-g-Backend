import { Request, Response } from "express";
import { fail } from "../../errors";
import { pullChanges, pushChanges } from "../../services/sync/sync.service";

export const pushSync = async (req: Request, res: Response) => {
    try {
        const results = await pushChanges(Number(req.user.userId), req.body?.changes);
        res.status(200).json({ results });
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};

export const pullSync = async (req: Request, res: Response) => {
    const since = Array.isArray(req.query.since) ? req.query.since[0] : req.query.since;
    try {
        const data = await pullChanges(Number(req.user.userId), since);
        res.status(200).json(data);
    } catch (error: unknown) {
        fail(res, error, 400);
    }
};
