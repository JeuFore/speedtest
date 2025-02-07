import Koa from "koa";
import Router from "@koa/router";
import { bodyParser } from "@koa/bodyparser";
import tracer from "tracer";
import "dotenv/config";

import SpeedtestController from "./controllers/speedtest";
import Database from "./utils/database";

const logger = tracer.console({
  format:
    process.env.LOG_LEVEL === "debug"
      ? "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})"
      : "{{timestamp}} <{{title}}> {{message}}",
  preprocess: function (data) {
    data.title = data.title.toUpperCase();
  },
  level: process.env.LOG_LEVEL || "info",
});

const database = new Database(logger);

const router = new Router();

const app = new Koa();

const authMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
  const { authorization } = ctx.request.headers;
  if (process.env.TOKEN && authorization !== process.env.TOKEN)
    ctx.throw(401, "Unauthorized");
  await next();
};

router.get("/healthz", async (ctx: Koa.Context) => {
  const checkDbStatus = await database.checkDbStatus();
  ctx.body = checkDbStatus ? "OK" : "NOT OK";
  ctx.status = checkDbStatus ? 200 : 500;
});

const speedtestController = new SpeedtestController(logger);

router.post(
  "/speedtest/start",
  authMiddleware,
  speedtestController.start.bind(speedtestController)
);

router.get(
  "/speedtest",
  authMiddleware,
  speedtestController.index.bind(speedtestController)
);

router.get(
  "/speedtest/:id",
  authMiddleware,
  speedtestController.show.bind(speedtestController)
);

router.delete(
  "/speedtest/:id",
  authMiddleware,
  speedtestController.delete.bind(speedtestController)
);

router.get(
  "/api/speedtest/latest",
  speedtestController.latest.bind(speedtestController)
);

// Set up logger
app.use(async (ctx: Koa.Context, next: Koa.Next) => {
  if (ctx.url === "/healthz") return await next();
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(process.env.PORT || 3000);

logger.info("Server started on port " + (process.env.PORT || 3000));
