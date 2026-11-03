import { Response } from "express";

export class ForbiddenError extends Error {
    constructor() {
        super("No puedes ver datos de otro usuario.");
    }
}

export function fail(res: Response, error: unknown, fallback: number) {
    const message = error instanceof Error ? error.message : "Error";
    const status = error instanceof ForbiddenError ? 403 : fallback;
    res.status(status).json({ status, message });
}
