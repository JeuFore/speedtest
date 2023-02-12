<h1 align="center">Speedtest koa api</h1>

## Getting Started

### With Docker

Using docker compose:

```yaml
version: "3"
services:
  speedtest:
    image: ghcr.io/jeufore/speedtest:latest
    container_name: speedtest
    volumes: 
      - ./database:/usr/src/app/database # if use sqlite
```

or docker run
```bash
docker run -d \
    --privileged \
    --name control-node \
    -v ./database:/usr/src/app/database
    ghcr.io/jeufore/control-node:latest
```

Insert **devices.js** in const folder

### For the development

```bash
# install dependencies project
npm i

# start project
npm start
```

## .env
| Parameter             | Example value                                 | Description                               |
|-----------------------|-----------------------------------------------|-------------------------------------------|
| DB_DRIVER             | "postgres"                                    | Database driver (sqlite, postgres)        |
| DB_HOST               | "128.210.289"                                 | Database host                             |
| DB_DATABASE           | "user"                                        | Database db                               |
| DB_PORT               | 5432                                          | Database port                             |
| DB_USERNAME           | postgres                                      | Databaset host                            |
| DB_PASSWORD           | "dzenofz27Nze"                                | Database password                         |
| INFLUXDB_URL          | "http://influx:3892"                          | InfluxDb url                              |
| INFLUXDB_TOKEN        | "dkezjfkenzfjeznfjn2874nlfzef"                | InfluxDb token                            |
| INFLUXDB_ORG          | "admin_org"                                   | InfluxDb org                              |
| INFLUXDB_BUCKET       | "speedtest_bucket"                            | InfluxDb bucket                           |
| TOKEN                 | "dpizdkelzjfnkjJLKEF"                         | Token to use the API # optional           |
| SERVER_IDS            | "1,2"                                         | Specify server ids # optional             |
| EXCLUDE_SERVER_IDS    | "3,4"                                         | Excluded server ids # optional            |
<br/>