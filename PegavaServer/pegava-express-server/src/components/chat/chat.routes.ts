import { Router } from "express";
import { jwtAuth } from "../../middlewares/jwt";
import { models } from "../../models";

const router = Router();

const PREFIX = "/chats";

router.get(`${PREFIX}/all-messages`, jwtAuth, async (req, res) => {
  const allUserChats = await models.ChatMember.findAll({
    attributes: ["chatId"],
    where: {
      userId: res.locals.user.id,
    },
  });

  const allBelongedMessages = await models.Message.findAll({
    attributes: ["id", "content", "chatId"],
    where: {
      chatId: allUserChats.map(({ chatId }) => chatId),
    },
    include: [
      {
        association: "author",
        attributes: ["firstName"],
        include: [
          {
            association: "avatars",
            attributes: ["url"],
            limit: 1,
          },
        ],
      },
    ],
    limit: 1,
    order: [["updatedAt", "desc"]],
  });

  const resultMessages = allBelongedMessages.map((message) => ({
    id: message.id,
    lastMessage: message.content,
    userAvatar:
      message.author.avatars.length > 0
        ? `http://10.0.2.2:7654/${message.author.avatars[0].url}`
        : null,
    firstName: message.author.firstName,
  }));

  return res.json(resultMessages);
});

export default router;
