require('dotenv').config()

const CronJob = require('cron').CronJob;

const { startSpeedtest } = require('./speedtest');

module.exports = (database, influxdb) => {
    if (!parseInt(process.env.JOB)) {
        console.info("CRON: Disabled");
        return;
    }
    new CronJob(
        (parseInt(process.env.JOB) || 30) + ' * * * *',
        async () => {
            console.log("CRON: Starting speedtest");
            try {
                const speedtest = await startSpeedtest();
                await database.insertSpeedtest(speedtest);
                await influxdb.insertSpeedtest(JSON.parse(speedtest));
                console.log("CRON: Speedtest done");
            }
            catch (e) {
                console.error(e);
            }
        },
        null,
        true,
        'Europe/Paris'
    )
};