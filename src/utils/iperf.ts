import { exec } from "child_process";
import "dotenv/config";
import { Tracer } from "tracer";
import { delay } from ".";
import { IperfResponse } from "../types/iperf";

export default class Speedtest {
  private logger: Tracer.Logger<string>;

  constructor(logger: Tracer.Logger<string>) {
    this.logger = logger;
  }

  async start(reverse?: boolean): Promise<null | IperfResponse> {
    try {
      this.logger.info(`Starting ${reverse ? "download" : "upload"} speedtest`);

      const url = process.env.IPERF_URL;
      const ports = process.env.IPERF_PORTS?.split(",");

      if (!url || !ports)
        throw new Error("IPERF_URL or IPERF_PORTS is not set");

      const port =
        ports.length === 1
          ? ports[0]
          : ports[Math.floor(Math.random() * (ports.length + 1))];
      let command = `iperf3 -c ${url} -p ${port} -J -P 10`;
      if (reverse) command += " -R";

      this.logger.debug(`Running command: ${command}`);

      const response = await new Promise<IperfResponse>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject("Speedtest timed out");
        }, 10000);

        exec(command, (error, stdout, stderr) => {
          clearTimeout(timeout);
          try {
            let errorMessage = "";
            if (error) errorMessage = JSON.parse(stdout)?.error;

            if (error || stderr) reject(errorMessage || stderr);

            resolve(JSON.parse(stdout));
          } catch (error) {
            reject("Error starting speedtest");
          }
        });
      });
      this.logger.info("Speedtest completed");

      return response;
    } catch (error) {
      if (error === "the server is busy running a test. try again later") {
        this.logger.error("the server is busy running a test. try again later");
        await delay(10000);
        return this.start();
      } else {
        this.logger.error("Error starting speedtest", error);
        return null;
      }
    }
  }
}
