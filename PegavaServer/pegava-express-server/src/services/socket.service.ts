import { Server } from "socket.io";
import { models } from "../models";

export let socket;

export const initSocket = (httpServer) => {
  socket = new Server(httpServer);

  socket.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on("disconnect", () => {
      socket.disconnect();
      console.log("🔥: A user disconnected");
    });

    socket.on(
      "send-message",
      async (
        {
          chatId,
          message,
          senderId,
        }: {
          chatId: number;
          message: string;
          senderId: number;
        },
        cb: any
      ) => {
        await models.Message.create({
          chatId,
          content: message,
          authorId: senderId,
        });

        socket.emit("new-message", { chatId });
        cb();
      }
    );

    socket.on(
      "read-all-message",
      async ({ chatId, readerId }: { chatId: number; readerId: number }) => {
        const readedMessagesCount = await models.ReadedMessage.findAll({
          include: [
            {
              association: "parentMessage",
              model: models.Message,
              required: true,
              include: [
                {
                  association: "chat",
                  where: {
                    id: chatId,
                  },
                  required: true,
                },
              ],
            },
          ],
        });

        const allChatMessages = await models.Message.findAll({
          where: {
            chatId: chatId,
          },
        });

        const allReadedMessagesIds = readedMessagesCount.map(
          (el) => el.messageId
        );

        await models.ReadedMessage.bulkCreate(
          allChatMessages
            .filter(
              (commonMessage) =>
                !allReadedMessagesIds.includes(commonMessage.id)
            )
            .map((el) => ({
              userId: readerId,
              messageId: el.id,
            }))
        );
      }
    );
  });
};
