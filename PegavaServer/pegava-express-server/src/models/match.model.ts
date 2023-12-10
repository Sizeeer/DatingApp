import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { Models } from ".";

export interface MatchAttributes {
  id: number;
  seekerId: number;
  pairId: number;
  result: number;
  createdAt: string;
}

export interface MatchCreateAttributes
  extends Optional<MatchAttributes, "id" | "createdAt"> {}

export class Match
  extends Model<MatchAttributes, MatchCreateAttributes>
  implements MatchAttributes
{
  // https://sequelize.org/master/manual/typescript.html
  public static associations: {};

  id: number;
  seekerId: number;
  pairId: number;
  result: number;
  readonly createdAt: string;

  static associate(models: Models) {
    Match.belongsTo(models.User, { as: "seeker", foreignKey: "seekerId" });

    Match.belongsTo(models.User, { as: "pair", foreignKey: "pairId" });
  }
}

export default (sequelize: Sequelize) => {
  Match.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      seekerId: { type: DataTypes.INTEGER, allowNull: false },
      pairId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      result: {
        type: DataTypes.INTEGER,
        comment:
          "Реультат метчинга. Если пусто, то пользователю можно предлагать, если занято, то человек, который был предложен, уже получил уведоиление",
      },
      createdAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "Matches",
      modelName: "Match",
      updatedAt: false,
    }
  );
  return Match;
};
