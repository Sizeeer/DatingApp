import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { Models } from ".";

export interface ReadedMessageAttributes {
  userId: number;
  messageId: number;
  createdAt: string;
}

export class ReadedMessage
  extends Model<ReadedMessageAttributes>
  implements ReadedMessageAttributes
{
  // https://sequelize.org/master/manual/typescript.html
  public static associations: {};

  declare userId: number;
  declare messageId: number;
  declare readonly createdAt: string;

  static associate(models: Models) {
    ReadedMessage.belongsTo(models.Message, {
      foreignKey: "messageId",
      as: "parentMessage",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }
}

export default (sequelize: Sequelize) => {
  ReadedMessage.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      messageId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      createdAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "ReadedMessages",
      modelName: "ReadedMessage",
      updatedAt: false,
    }
  );
  return ReadedMessage;
};
