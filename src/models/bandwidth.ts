import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  DataTypes,
  ModelStatic,
  Model,
} from "sequelize";

export class Bandwidth extends Model<
  InferAttributes<Bandwidth>,
  InferCreationAttributes<Bandwidth>
> {
  declare id: CreationOptional<number>;
  declare bytes: number;
  declare bits_per_second: number;
  declare bandwidth: number;
  declare type: "download" | "upload";
  declare host_id: number;
  declare created_at?: Date;
  declare updated_at?: Date;
  static associate: (models: any) => void;
}

export default (sequelize: Sequelize): ModelStatic<Bandwidth> => {
  const bandwidth = Bandwidth.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      bytes: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      bits_per_second: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      bandwidth: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("download", "upload"),
        allowNull: false,
      },
      host_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "bandwidth",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  bandwidth.associate = (models) => {
    bandwidth.belongsTo(models.host, { foreignKey: "host_id", as: "host" });
  };

  return bandwidth;
};
