import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import microConf from './mikro-orm.config';
import express from 'express';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { __prod__ } from './consts';
import { MyContext } from './types';

const main = async () => {
    const orm = await MikroORM.init(microConf);
    await orm.getMigrator().up();

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();
    app.use(
        session({
            name: 'qid',
            store: new RedisStore({
                client: redisClient,
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

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }): MyContext => ({
            em: orm.em,
            res,
            req,
        }),
    });
    apolloServer.applyMiddleware({ app });
    app.listen(2000, () => {
        console.log('server started on localhost:2000');
    });
};
try {
    main();
} catch (e) {
    console.error(e);
}
