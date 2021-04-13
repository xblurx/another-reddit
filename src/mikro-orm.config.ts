import { Post, User } from './entities/';
import { Options } from '@mikro-orm/core';
import path from 'path';

const config: Options = {
    entities: [Post, User],
    dbName: 'reddit',
    type: 'postgresql',
    debug: process.env.NODE_ENV !== 'production',
    user: 'postgres',
    password: 'postgres',
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/, // re
    },
};

export default config;
