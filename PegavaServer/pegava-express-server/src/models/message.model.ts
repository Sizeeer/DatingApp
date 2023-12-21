import { DataTypes, Model, Op, Sequelize } from "sequelize";
import { Models } from ".";
import { User } from "./user.model";

export type MessageAttributes = {
  id: number;
  content: string;
  authorId: number;
  chatId: number;
  createdAt: Date;
  updatedAt: Date;
};

export class Message
  extends Model<MessageAttributes>
  implements MessageAttributes
{
  declare id: number;
  declare content: string;
  declare authorId: number;
  declare chatId: number;
  declare createdAt: Date;
  declare updatedAt: Date;

  declare author?: User;

  static associate(models: Models) {
    Message.belongsTo(models.Chat, { foreignKey: "chatId", as: "chat" });
    Message.hasMany(models.ReadedMessage, {
      foreignKey: "messageId",
      as: "readedMessages",
    });
    Message.belongsTo(models.User, {
      foreignKey: "authorId",
      as: "author",
    });
  }
}

export default (sequelize: Sequelize) => {
  Message.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      content: {
        type: DataTypes.STRING(2000),
        allowNull: false,
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      tableName: "Messages",
      modelName: "Message",
      sequelize,
    }
  );
  return Message;
};
