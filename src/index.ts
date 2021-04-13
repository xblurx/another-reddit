import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core';
import microConf from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from "./resolvers/post";

const main = async () => {
    const orm = await MikroORM.init(microConf);
    await orm.getMigrator().up();

    const app = express();
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false,
        }),
        context: () => ({
            em: orm.em
        })
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
