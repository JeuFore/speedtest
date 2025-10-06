import tracer from "tracer";
import "dotenv/config";
import Speedtest from "./utils/iperf";
import { Host } from "./models/host";
import { Bandwidth } from "./models/bandwidth";
import { delay } from "./utils";
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

new Database(logger);
const speedtest = new Speedtest(logger);

async function test(reverse?: boolean): Promise<void> {
  const data = await speedtest.start(reverse);

  if (!data) throw new Error("Error starting speedtest");

  if (!data.start.connecting_to?.host)
    throw new Error("Host not found in response");

  if (!("sum_sent" in data.end))
    throw new Error("Received invalid response from iperf");

  let host = await Host.findOne({
    where: { name: data.start.connecting_to.host },
  });

  if (!host)
    host = await Host.create({
      name: data.start.connecting_to.host,
      ports: [data.start.connecting_to.port],
    });
  else if (!host.ports.includes(data.start.connecting_to.port))
    await host.update({
      ports: [...host.ports, data.start.connecting_to.port],
    });

  await Bandwidth.create({
    host_id: host.id,
    bytes: data.end.sum_sent.bytes,
    bits_per_second: data.end.sum_sent.bits_per_second,
    bandwidth: data.end.sum_sent.bits_per_second / 1000000,
    type: reverse ? "download" : "upload",
  });
}

let uploadIsSuccess = false;
async function main(): Promise<void> {
  if (!uploadIsSuccess) {
    try {
      await test();
      uploadIsSuccess = true;
    } catch (error) {
      logger.error("Error running upload test", error);
      main();
    }

    await delay(10000);
  }

  try {
    await test(true);
  } catch (error) {
    logger.error("Error running download test", error);
  }
}

main();
