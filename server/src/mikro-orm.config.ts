import { Post, User } from './entities/';
import { Options } from '@mikro-orm/core';
import path from 'path';
import { __prod__ } from "./consts";

const config: Options = {
    entities: [Post, User],
    dbName: 'reddit',
    type: 'postgresql',
    debug: !__prod__,
    user: 'postgres',
    password: 'postgres',
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
};

export default config;
