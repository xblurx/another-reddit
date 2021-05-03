import 'reflect-metadata';
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

dotenv.config();

const main = async () => {
    await createConnection();
    // await conn.runMigrations();

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis();

    app.use(
        cors({
            origin: 'http://localhost:3000',
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
            secret: 'todo env_var',
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
        }),
    });
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(2000, () => {
        console.log('server started on localhost:2000');
    });
};

try {
    main();
} catch (e) {
    console.error(e);
}
