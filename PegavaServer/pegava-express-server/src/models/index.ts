import { DataTypes, ModelCtor, Op, Sequelize } from "sequelize";
import { User } from "./user.model";
import { Avatar } from "./avatar.model";
import { Match } from "./match.model";
import { Chat } from "./chat.model";
import { ChatMember } from "./chatMember.model";
import { Message } from "./message.model";
import { ReadedMessage } from "./readedMessage.model";

const { env } = process;

const sequelize = new Sequelize(
  env.PEGAVA_DB_NAME,
  env.PEGAVA_DB_USER,
  env.PEGAVA_DB_PASSWORD,
  //@ts-ignore sequelize bug with dialect type
  {
    host: env.PEGAVA_DB_HOST,
    port: env.PEGAVA_DB_PORT as unknown as number,
    dialect: "postgres",
    logging: false,
    logQueryParameters: false,
    dialectOptions: { decimalNumbers: true },
    operatorsAliases: {
      $contains: Op.contains,
      $contained: Op.contained,
      $in: Op.in,
    },
  }
);

export type Models = {
  [name: string]: ModelCtor<any>;
  User: ModelCtor<User>;
  Avatar: ModelCtor<Avatar>;
  Match: ModelCtor<Match>;
  Chat: ModelCtor<Chat>;
  ChatMember: ModelCtor<ChatMember>;
  Message: ModelCtor<Message>;
  ReadedMessage: ModelCtor<ReadedMessage>;
};

// @ts-ignore TODO:
const models: Models = {};

[
  require("./user.model"),
  require("./avatar.model"),
  require("./match.model"),
  require("./chat.model"),
  require("./chatMember.model"),
  require("./message.model"),
  require("./readedMessage.model"),
].forEach(({ default: mdl }) => {
  const model = mdl(sequelize, DataTypes);
  models[model.name] = model;
});

// WARN: В тестах с БД делается sync({force : true }) для очистки бд, два запущенных синка -> падение тестов
// sequelize.sync({ alter: true }).then(() => console.log('finish'));
// @ts-ignore Потому что ради одного раза не буду расширять тайпинги
Object.values(models).forEach((mdl) => mdl?.associate?.(models));

sequelize.sync({ force: true });

export { models, sequelize, Sequelize };
