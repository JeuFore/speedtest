const logger = require('koa-logger')
require('dotenv').config()

const Koa = require('koa');
const app = new Koa();
const router = require('@koa/router')();

const { acceptEulaSpeedtest, startSpeedtest, EULA_IS_ACCEPTED } = require('./utils/speedtest');

const Database = require('./database');
const database = new Database({
    dialect: process.env.DB_DRIVER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
});

const Influxdb = require('./influxdb');
const influxdb = new Influxdb(process.env.INFLUXDB_URL, process.env.INFLUXDB_TOKEN, process.env.INFLUXDB_ORG, process.env.INFLUXDB_BUCKET);

require('./utils/cron')(database, influxdb);

const authMiddleware = async (ctx, next) => {
    const { authorization } = ctx.request.headers;
    if (process.env.TOKEN && authorization !== process.env.TOKEN)
        ctx.throw(401, "Unauthorized");
    await next();
}

acceptEulaSpeedtest();

router.get('/healthz', async (ctx, next) => {
    ctx.body = database.checkDbStatus() && EULA_IS_ACCEPTED() ? 'OK' : 'NOT OK';
    ctx.status = database.checkDbStatus() && EULA_IS_ACCEPTED() ? 200 : 500;
});

router.post('/speedtest/start', authMiddleware, async (ctx, next) => {
    const { serverIds } = ctx.request.body || {};
    const speedtest = await startSpeedtest(serverIds);
    influxdb.insertSpeedtest(speedtest);
    ctx.body = await database.insertSpeedtest(speedtest);
});

router.get('/speedtest', authMiddleware, async (ctx, next) => {
    ctx.body = await database.getSpeedtest();
});

router.get('/speedtest/average', authMiddleware, async (ctx, next) => {
    ctx.body = await database.getAverageSpeedtest(ctx.request.query?.range);
});

router.get('/speedtest/:id', authMiddleware, async (ctx, next) => {
    const { id } = ctx.params;
    ctx.body = await database.getSpeedtestById(id);
});

router.delete('/speedtest/:id', authMiddleware, async (ctx, next) => {
    const { id } = ctx.params;
    ctx.body = await database.deleteSpeedtestById(id);
});

router.get('/api/speedtest/latest', async (ctx, next) => {
    const speedtest = await database.getLatestSpeedtest()

    const data = {
        data: {
            id: speedtest?.id || null,
            ping: speedtest?.ping.avg || 0,
            download: speedtest?.download?.bandwidth || 0,
            upload: speedtest?.upload?.bandwidth || 0,
            created_at: speedtest?.createdAt,
            updated_at: speedtest?.updatedAt,
            server_id: speedtest?.server_id || null,
            server_name: speedtest?.server.name,
            server_host: speedtest?.server.host,
            url: speedtest?.result_url,
        }
    }

    ctx.body = data
});

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.statusCode || err.status || 500;
        ctx.body = {
            message: err?.message || err
        };
    }
});

app.use(logger())

app
    .use(router.routes())
    .use(router.allowedMethods());

console.info(`Server running on port ${process.env.PORT || 3000}`);

app.listen(process.env.PORT || 3000);