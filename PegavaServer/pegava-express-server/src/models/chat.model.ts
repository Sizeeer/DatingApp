import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { Models } from ".";

export interface ChatAttributes {
  id: number;
  createdAt: string;
}

export interface ChatCreateAttributes
  extends Optional<ChatAttributes, "id" | "createdAt"> {}

export class Chat
  extends Model<ChatAttributes, ChatCreateAttributes>
  implements ChatAttributes
{
  // https://sequelize.org/master/manual/typescript.html
  public static associations: {};

  declare id: number;
  declare readonly createdAt: string;

  static associate(models: Models) {
    Chat.hasMany(models.ChatMember, {
      foreignKey: "chatId",
      as: "members",
    });

    Chat.hasMany(models.Message, {
      foreignKey: "chatId",
      as: "messages",
    });
  }
}

export default (sequelize: Sequelize) => {
  Chat.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      createdAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "Chats",
      modelName: "Chat",
      updatedAt: false,
    }
  );
  return Chat;
};
