import { Model, ModelStatic, Sequelize } from "sequelize";
import { Tracer } from "tracer";
import pg from "pg";
import sequelize from "sequelize";
import "dotenv/config";
import models from "../models";

export default class Database {
  private sequelize: Sequelize;
  public models: { [key: string]: ModelStatic<Model> };
  private logger: Tracer.Logger<string>;

  constructor(logger: Tracer.Logger<string>) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

    this.sequelize = new Sequelize(process.env.DATABASE_URL, {
      logging: (msg) => logger.debug(msg),
      dialectModule: process.env.DATABASE_URL.includes("postgres")
        ? pg
        : sequelize,
    });
    this.logger = logger;

    this.models = {};
    this.init();
  }

  async init() {
    Object.entries(models).forEach(([name, model]) => {
      this.models[name] = model(this.sequelize);
    });
    Object.values(this.models).forEach((model) => {
      if ("associate" in model && typeof model.associate === "function")
        model.associate(this.models);
    });
    this.sequelize.sync();
  }

  async checkDbStatus(): Promise<boolean> {
    return new Promise((resolve) => {
      this.sequelize
        .authenticate()
        .then(() => resolve(true))
        .catch((err) => {
          this.logger.error("Unable to connect to the database:", err);
          resolve(false);
        });
    });
  }
}
