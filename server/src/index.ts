import 'reflect-metadata';
import 'dotenv-safe/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import Redis from 'ioredis';
import connectRedis from 'connect-redis';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver, UserResolver } from './resolvers';
import { __prod__, COOKIE_NAME } from './consts';
import { MyContext } from './types';
import { createConnection } from 'typeorm';
import dotenv from 'dotenv';
import { createUserLoader } from './utils/createUserLoader';

dotenv.config();

const main = async () => {
    await createConnection();
    // await conn.runMigrations();

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis(process.env.REDIS_URL);

    app.use(
        cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        })
    );
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
                secure: __prod__,
                sameSite: 'lax',
            },
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
        })
    );
    app.disable('x-powered-by');

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }): MyContext => ({
            res,
            req,
            redis,
            userLoader: createUserLoader(),
        }),
    });
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(parseInt(process.env.PORT), () => {
        console.log(`server started on localhost:${process.env.PORT}`);
    });
};

try {
    main();
} catch (e) {
    console.error(e);
}
