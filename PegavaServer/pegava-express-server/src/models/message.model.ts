import { DataTypes, Model, Op, Sequelize } from "sequelize";
import { Models } from ".";

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
  id: number;
  content: string;
  authorId: number;
  chatId: number;
  createdAt: Date;
  updatedAt: Date;

  static associate(models: Models) {
    Message.belongsTo(models.Chat, { foreignKey: "chatId", as: "chat" });
    Message.hasMany(models.ReadedMessage, {
      foreignKey: "messageId",
      as: "readedMessages",
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
