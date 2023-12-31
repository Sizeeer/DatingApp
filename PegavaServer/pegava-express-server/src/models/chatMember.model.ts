import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { Models } from ".";
import { User } from "./user.model";

export interface ChatMemberAttributes {
  id: number;
  chatId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMemberCreateAttributes
  extends Optional<ChatMemberAttributes, "id" | "createdAt" | "updatedAt"> {}

export class ChatMember
  extends Model<ChatMemberAttributes, ChatMemberCreateAttributes>
  implements ChatMemberAttributes
{
  // https://sequelize.org/master/manual/typescript.html
  public static associations: {};

  declare id: number;
  declare chatId: number;
  declare userId: number;
  declare readonly updatedAt: string;
  declare readonly createdAt: string;

  declare user?: User;

  static associate(models: Models) {
    ChatMember.belongsTo(models.Chat, { foreignKey: "chatId", as: "chat" });

    ChatMember.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  }
}

export default (sequelize: Sequelize) => {
  ChatMember.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
      },
      chatId: { type: DataTypes.INTEGER, primaryKey: true },
      userId: { type: DataTypes.INTEGER, primaryKey: true },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "ChatMembers",
      modelName: "ChatMember",
    }
  );
  return ChatMember;
};
