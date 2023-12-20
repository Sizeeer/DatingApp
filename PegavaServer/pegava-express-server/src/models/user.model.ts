import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { Models } from ".";

export interface UserAttributes {
  id: number;
  firstName: string;
  whoToShow: number;
  bio: string;
  phone: string;
  geo: {
    type: "Point";
    coordinates: [number, number];
  };
  sex: number;
  updatedAt: string;
  createdAt: string;
}

export interface UserCreateAttributes
  extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> {}

export class User
  extends Model<UserAttributes, UserCreateAttributes>
  implements UserAttributes
{
  // https://sequelize.org/master/manual/typescript.html
  public static associations: {};

  id: number;
  firstName: string;
  whoToShow: number;
  bio: string;
  phone: string;
  geo: {
    type: "Point";
    coordinates: [number, number];
  };
  sex: number;
  readonly updatedAt: string;
  readonly createdAt: string;

  static associate(models: Models) {
    User.hasMany(models.Avatar, {
      foreignKey: "userId",
      as: "avatars",
    });

    User.belongsToMany(models.User, {
      through: models.Match,
      as: "pairs",
      foreignKey: "seekerId",
    });
  }
}

export default (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: { type: DataTypes.STRING(30), allowNull: false },
      bio: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      geo: {
        type: DataTypes.GEOGRAPHY("POINT"),
        allowNull: false,
      },
      whoToShow: {
        type: DataTypes.SMALLINT,
        allowNull: false,
      },
      sex: {
        type: DataTypes.SMALLINT,
        allowNull: false,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "Users",
      modelName: "User",
    }
  );
  return User;
};
