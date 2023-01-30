const { Sequelize } = require('sequelize');
const { mkdirSync } = require('fs')

const { convertBandwidth } = require('./utils');

const models = require('./models');

module.exports = class Database {
    constructor({ host, port, username, database, password, dialect = 'sqlite', dbName = 'db.sqlite' }) {
        mkdirSync('./database', { recursive: true })
        this.sequelize = new Sequelize({
            dialect,
            storage: dialect === 'sqlite' && './database/' + dbName,
            host,
            port,
            database,
            username,
            password,
            logging: false,
        });
        this.dialect = dialect
        this.models = {}
        this.isOk = false
        this.init();
        setInterval(() => {
            this.checkDbStatus()
        }, 30 * 1000);
    }

    async init() {
        Object.entries(models)
            .forEach(([name, model]) => {
                this.models[name] = model(this.sequelize)
            });
        Object.values(this.models)
            .filter((model) => typeof model.associate === 'function')
            .forEach((model) => model.associate(this.models));
        this.sequelize.sync();
    }



    async checkDbStatus() {
        this.sequelize.authenticate()
            .then(() => {
                this.isOk = true
            })
            .catch(err => {
                this.isOk = false
                console.error('Unable to connect to the database:', err);
            });
        return this.isOk
    }

    async insertSpeedtest(s) {
        const { download, upload, ping, server, result } = s;

        let serverId = (await this.models.Server.findByPk(server.id))?.id;

        if (!serverId)
            serverId = (await this.models.Server.create(server))?.id

        return this.models.Speedtest.create({
            result_id: result.id,
            result_url: result.url,
            created_at: result.timestamp,
            download: {
                bytes: download.bytes,
                bandwidth: convertBandwidth(download.bandwidth),
                elapsed: download.elapsed,
                latency_iqm: download.latency.iqm,
                latency_jitter: download.latency.jitter,
                latency_low: download.latency.low,
                latency_high: download.latency.high,
                latency_avg: (download.latency.low + download.latency.high) / 2,
                created_at: result.timestamp
            },
            upload: {
                bytes: upload.bytes,
                bandwidth: convertBandwidth(upload.bandwidth),
                elapsed: upload.elapsed,
                latency_iqm: upload.latency.iqm,
                latency_jitter: upload.latency.jitter,
                latency_low: upload.latency.low,
                latency_high: upload.latency.high,
                latency_avg: (upload.latency.low + upload.latency.high) / 2,
                created_at: result.timestamp
            },
            ping: {
                ...ping,
                avg: (ping.low + ping.high) / 2,
                created_at: result.timestamp
            },
            server_id: serverId
        },
            {
                include: [
                    'upload',
                    'ping',
                    'server',
                    'download'
                ]
            }
        )
    }


    getSpeedtest() {
        return new Promise(async (resolve, reject) => {
            this.sequelize.models.speedtest.findAll().then((speedtests) => {
                resolve(speedtests);
            }
            ).catch((err) => {
                reject(err);
            });
        });
    }

    getSpeedtestById(id) {
        return new Promise(async (resolve, reject) => {
            this.sequelize.models.speedtest.findByPk(id,
                {
                    include: [
                        'upload',
                        'ping',
                        'server',
                        'download'
                    ]
                }
            ).then((speedtest) => {
                resolve(speedtest);
            }
            ).catch((err) => {
                reject(err);
            });
        });
    }

    deleteSpeedtestById(id) {
        return new Promise(async (resolve, reject) => {
            this.sequelize.models.speedtest.findByPk(id,
                {
                    include: [
                        'upload',
                        'ping',
                        'server',
                        'download'
                    ]
                }
            ).then((speedtest) => {
                if (!speedtest)
                    reject('Speedtest not found')
                speedtest.destroy();
                resolve(speedtest);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    getAverageSpeedtest(range) {
        return new Promise(async (resolve, reject) => {
            let request = `SELECT
                                AVG(downloads.bandwidth) as downloads,
                                AVG(uploads.bandwidth) as uploads,
                                AVG(pings.avg) as pings
                            FROM speedtests
                            INNER JOIN downloads ON speedtests.download_id = downloads.id
                            INNER JOIN uploads ON speedtests.upload_id = uploads.id
                            INNER JOIN pings ON speedtests.ping_id = pings.id
                            `
            if (range)
                request += this.dialect === 'sqlite' ? `WHERE speedtests.created_at > datetime('now', '-${range} days')` : `WHERE speedtests.created_at > now() - interval '${range} days'`
            this.sequelize.query(request).then(([results, metadata]) => {
                resolve(results[0]);
            }
            ).catch((err) => {
                reject(err);
            });
        });
    }

    getLatestSpeedtest() {
        return new Promise(async (resolve, reject) => {
            this.models.Speedtest.findOne({
                order: [['created_at', 'DESC']],
                limit: 1,
                include: [
                    'upload',
                    'ping',
                    'server',
                    'download'
                ]
            }).then((speedtest) => {
                resolve(speedtest);
            }
            ).catch((err) => {
                reject(err);
            });
        });
    }
}