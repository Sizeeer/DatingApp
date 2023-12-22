import { Router } from "express";
import { jwtAuth } from "../../middlewares/jwt";
import { models } from "../../models";
import { Op } from "sequelize";
import { validateBySchemaAndExtract } from "../../middlewares/validateBySchemaAndExtract";
import { RequestWithValidatedData } from "../../middlewares/extractValidatedData";

const router = Router();

const PREFIX = "/chats";

router.get(`${PREFIX}/all-messages`, jwtAuth, async (req, res) => {
  const chatMembersWithChatId = await models.ChatMember.findAll({
    attributes: ["chatId"],
    where: {
      userId: res.locals.user.id,
    },
  });

  const allUserChats = await models.Chat.findAll({
    attributes: ["id"],
    where: {
      id: chatMembersWithChatId.map(({ chatId }) => chatId),
    },
    include: [
      {
        association: "messages",
        include: [
          {
            association: "author",
            include: [
              {
                association: "avatars",
              },
            ],
          },
        ],
        limit: 1,
        order: [["updatedAt", "desc"]],
      },
    ],
  });

  let preResultChats = [];

  for (const chat of allUserChats) {
    const readedMessagesCount = await models.ReadedMessage.count({
      include: [
        {
          association: "parentMessage",
          model: models.Message,
          required: true,
          where: {
            authorId: {
              [Op.ne]: res.locals.user.id,
            },
          },
          include: [
            {
              association: "chat",
              where: {
                id: chat.id,
              },
              required: true,
            },
          ],
        },
      ],
    });

    const allChatMessages = await models.Message.count({
      where: {
        chatId: chat.id,
        authorId: {
          [Op.ne]: res.locals.user.id,
        },
      },
    });

    preResultChats = [
      ...preResultChats,
      {
        ...chat.toJSON(),
        unreadedMessagesCount: allChatMessages - readedMessagesCount,
      },
    ];
  }

  const resultMessages = await Promise.all(
    preResultChats.map(async (chat) => {
      const pairInChat = await models.ChatMember.findOne({
        where: {
          id: {
            [Op.ne]: res.locals.user.id,
          },
          chatId: chat.id,
        },
        include: [
          {
            association: "user",
            include: [
              {
                association: "avatars",
              },
            ],
          },
        ],
      });

      return {
        id: chat.id,
        lastMessage: chat.messages[0]?.content,
        userAvatar:
          pairInChat.user.avatars.length > 0
            ? `http://10.0.2.2:7654/${pairInChat.user.avatars[0]?.url}`
            : null,
        firstName: pairInChat.user.firstName,
        unreadedMessagesCount: chat.unreadedMessagesCount,
        userId: pairInChat.user.id,
      };
    })
  );

  return res.json(resultMessages);
});

router.get(
  `${PREFIX}/:id/messages`,
  jwtAuth,
  validateBySchemaAndExtract({
    id: {
      isInt: true,
      toInt: true,
      in: ["params"],
    },
  }),
  async (req: RequestWithValidatedData<{ id: number }>, res) => {
    const { id } = req.validatedData;

    const messages = await models.Message.findAll({
      where: {
        chatId: id,
      },
      include: [
        {
          association: "author",
          include: [
            {
              association: "avatars",
              limit: 1,
            },
          ],
        },
      ],
    });

    const resultMessage = messages.map((message) => ({
      _id: message.id,
      message: message.content,
      createdAt: message.createdAt,
      self: message.authorId === res.locals.user.id,
    }));

    return res.json(resultMessage);
  }
);

export default router;
