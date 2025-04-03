import { Request, Response, NextFunction } from "express";
import redis from "../config/redis";
    
type Formatter<T> = (data: any) => T;
type CacheKeyBuilder = (req: Request) => string;


export const cacheMiddleware = <T>(cacheKeyBuilder: CacheKeyBuilder, formatter: Formatter<T>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const cacheKey = cacheKeyBuilder(req);  // Aquí se genera dinámicamente

        try {
            const cachedData = await redis.get(cacheKey);

            if (cachedData) {
                console.log(`Cache HIT: ${cacheKey}`);
                const parsedData = JSON.parse(cachedData);
                const formattedData = formatter(parsedData);
                res.json(formattedData);
                return;
            }

            console.log(`Cache MISS: ${cacheKey}`);
            next();
        } catch (error) {
            console.error("Error en cacheMiddleware:", error);
            next();
        }
    };
};

// Función para invalidar caché después de una actualización
export const clearCache = async (cacheKey: string) => {
    console.log(`Eliminando caché: ${cacheKey}`);
    await redis.del(cacheKey);
};
