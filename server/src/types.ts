import { Request, Response } from "express";
import { Redis } from "ioredis";

export type MyContext = {
    req: Request & {
        // @ts-ignore
        session: Express.Session;
    };
    res: Response;
    redis: Redis;
};
