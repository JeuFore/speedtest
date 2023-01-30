const { InfluxDB, Point } = require('@influxdata/influxdb-client')

const { convertBandwidth } = require('./utils');

module.exports = class Influxdb {
    constructor(url, token, org, bucket) {
        this.isEnabled = false
        if (!url || !token || !org || !bucket) {
            console.info('InfluxDB is not configured')
            return;
        }
        console.info('InfluxDB is configured')
        this.isEnabled = true
        this.client = new InfluxDB({ url, token })
        this.org = org
        this.bucket = bucket
        this.writeApi = this.client.getWriteApi(org, bucket)
    }

    async insertSpeedtest(s) {
        if (!this.isEnabled)
            return;
        const { download, upload, ping, server, result } = s;

        const downloadPoint = new Point('download')
            .intField('bytes', download.bytes)
            .floatField('bandwidth', convertBandwidth(download.bandwidth),)
            .intField('elapsed', download.elapsed)
            .floatField('latency_iqm', download.latency.iqm)
            .floatField('latency_jitter', download.latency.jitter)
            .floatField('latency_low', download.latency.low)
            .floatField('latency_high', download.latency.high)
            .floatField('latency_avg', (download.latency.low + download.latency.high) / 2)
            .intField('result_id', result.id)
            .stringField('result_url', result.url)
            .timestamp(result.timestamp)

        const uploadPoint = new Point('upload')
            .intField('bytes', upload.bytes)
            .floatField('bandwidth', convertBandwidth(upload.bandwidth),)
            .intField('elapsed', upload.elapsed)
            .floatField('latency_iqm', upload.latency.iqm)
            .floatField('latency_jitter', upload.latency.jitter)
            .floatField('latency_low', upload.latency.low)
            .floatField('latency_high', upload.latency.high)
            .floatField('latency_avg', (upload.latency.low + upload.latency.high) / 2)
            .intField('result_id', result.id)
            .stringField('result_url', result.url)
            .timestamp(result.timestamp)

        const pingPoint = new Point('ping')
            .floatField('jitter', ping.jitter)
            .floatField('latency', ping.latency)
            .floatField('low', ping.low)
            .floatField('high', ping.high)
            .floatField('avg', (ping.low + ping.high) / 2)
            .intField('result_id', result.id)
            .stringField('result_url', result.url)
            .timestamp(result.timestamp)

        const serverPoint = new Point('server')
            .intField('id', server.id)
            .stringField('host', server.host)
            .intField('port', server.port)
            .stringField('name', server.name)
            .stringField('location', server.location)
            .stringField('country', server.country)
            .stringField('ip', server.ip)
            .floatField('latency', server.latency)
            .floatField('download', convertBandwidth(server.download))
            .intField('result_id', result.id)
            .stringField('result_url', result.url)

        this.writeApi.writePoint(downloadPoint)
        this.writeApi.writePoint(uploadPoint)
        this.writeApi.writePoint(pingPoint)
        this.writeApi.writePoint(serverPoint)
        this.writeApi.flush()

        return s;
    }
}