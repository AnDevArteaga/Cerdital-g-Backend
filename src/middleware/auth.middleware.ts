import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) {
        res.status(401).json({ status: 401, message: "No token" });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        if (decoded.userId === undefined || decoded.userId === null) {
            res.status(401).json({ status: 401, message: "Token inválido" });
            return;
        }
        req.user = { userId: decoded.userId };
        next();
    } catch {
        res.status(401).json({ status: 401, message: "Token inválido" });
    }
};

export const ownsUser = (req: Request, res: Response, next: NextFunction) => {
    const claimed = req.params.user_id ?? req.body?.user_id;
    if (claimed !== undefined && claimed !== "" && Number(claimed) !== Number(req.user.userId)) {
        res.status(403).json({ status: 403, message: "No puedes ver datos de otro usuario." });
        return;
    }
    next();
};
