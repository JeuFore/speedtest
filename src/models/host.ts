import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  DataTypes,
  Model,
} from "sequelize";

export class Host extends Model<
  InferAttributes<Host>,
  InferCreationAttributes<Host>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare ports: number[];
}

export default (sequelize: Sequelize) => {
  const host = Host.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ports: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "host",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return host;
};
