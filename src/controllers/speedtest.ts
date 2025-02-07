import Koa from "koa";
import { Tracer } from "tracer";

import Iper from "../utils/iperf";
import { Bandwidth } from "../models/bandwidth";
import { Host } from "../models/host";

export default class SpeedtestController {
  private logger: Tracer.Logger<string>;
  private iperf: Iper;

  constructor(logger: Tracer.Logger<string>) {
    this.logger = logger;
    this.iperf = new Iper(logger);
  }

  private success(
    ctx: Koa.Context,
    data: any,
    message?: string,
    code = 200
  ): void {
    ctx.status = code;
    ctx.body = { type: "success", data, message };
  }

  private error(ctx: Koa.Context, message: string, code = 500): void {
    ctx.status = code;
    ctx.body = { type: "error", message };
  }

  public async start(ctx: Koa.Context): Promise<void> {
    if (
      ctx.request.body.download &&
      typeof ctx.request.body.download !== "boolean"
    )
      return this.error(ctx, "Invalid request body");
    const reverse = ctx.request.body.download || false;

    const data = await this.iperf.start(reverse);

    if (!data) return this.error(ctx, "Error starting speedtest");

    if (!data.start.connecting_to?.host)
      return this.error(ctx, "Host not found in response");

    if (!("sum_sent" in data.end))
      return this.error(ctx, "Received invalid response from iperf");

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

    const bandwidth = await Bandwidth.create({
      host_id: host.id,
      bytes: data.end.sum_sent.bytes,
      bits_per_second: data.end.sum_sent.bits_per_second,
      bandwidth: data.end.sum_sent.bits_per_second / 1000000,
      type: reverse ? "download" : "upload",
    });

    return this.success(ctx, {
      ...bandwidth.toJSON(),
      host: host.toJSON(),
    });
  }

  public async index(ctx: Koa.Context): Promise<void> {
    const { page = 1, limit = 100 }: { page: number; limit: number } =
      ctx.query as any;

    const bandwidths = await Bandwidth.findAll({
      include: "host",
      limit,
      offset: (page - 1) * limit,
    });

    this.success(ctx, bandwidths);
  }

  public async show(ctx: Koa.Context): Promise<void> {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) return this.error(ctx, "Invalid id");

    const bandwidth = await Bandwidth.findByPk(id, { include: "host" });

    if (!bandwidth) return this.error(ctx, "Bandwidth not found", 404);

    this.success(ctx, bandwidth);
  }

  public async delete(ctx: Koa.Context): Promise<void> {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) return this.error(ctx, "Invalid id");

    const bandwidth = await Bandwidth.findByPk(id);

    if (!bandwidth) return this.error(ctx, "Bandwidth not found", 404);

    await bandwidth.destroy();

    this.success(ctx, undefined, "Bandwidth deleted");
  }

  public async latest(ctx: Koa.Context): Promise<void> {
    const bandwidthUpload = await Bandwidth.findOne({
      include: "host",
      order: [["created_at", "DESC"]],
      where: { type: "upload" },
    });

    const bandwidthDownload = await Bandwidth.findOne({
      include: "host",
      order: [["created_at", "DESC"]],
      where: { type: "download" },
    });

    this.success(ctx, {
      id: null,
      ping: 0,
      download: (bandwidthDownload?.bits_per_second || 0) / 1_000_000,
      upload: (bandwidthUpload?.bits_per_second || 0) / 1_000_000,
      created_at: null,
      updated_at: null,
    });
  }
}
