import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Meta } from "../interfaces/meta.interface";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1] || "";
    if (!token) res.status(401).json({ data: "", status: 401, message: "No token" });
    try {
        jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        next();
    } catch (error: any) {
        const response: Meta = {
            status: 401,
            message: error.message,
        };
        res.status(401).json(response);
    }
};