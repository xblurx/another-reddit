import { MikroORM } from '@mikro-orm/core';
import microConf from './mikro-orm.config';
import express from 'express';

const main = async () => {
    const orm = await MikroORM.init(microConf);
    await orm.getMigrator().up();

    const app = express();
    app.get('/', (_, res) => {
        res.send('ehlo human');
    });
    app.listen(2000, () => {
        console.log('server started on localhost:4000');
    });
};
try {
    main();
} catch (e) {
    console.error(e);
}
