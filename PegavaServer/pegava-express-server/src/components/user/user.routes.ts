import { Router } from "express";
import path from "path";

import multer from "multer";
import { validateBySchemaAndExtract } from "../../middlewares/validateBySchemaAndExtract";
import { RequestWithValidatedData } from "../../middlewares/extractValidatedData";
import { Sequelize, models, sequelize } from "../../models";
import { jwtAuth } from "../../middlewares/jwt";
import jwt from "jsonwebtoken";
import { User } from "../../models/user.model";
import { QueryTypes } from "sequelize";
import { socket } from "../../services/socket.service";
import { HTTP_STATUS_CODES } from "../../constants/httpStatusCodes";

const router = Router();

const PREFIX = "/users";

router.get(`${PREFIX}/me`, jwtAuth, (req, res) => {
  const currentUser = res.locals.user;

  return res.json({
    ...currentUser.toJSON(),
    avatars: currentUser.toJSON().avatars.map((avatar) => {
      return {
        ...avatar,
        uri: `http://10.0.2.2:7654/${avatar.url}`,
      };
    }),
  });
});

router.get(
  `${PREFIX}/:id`,
  validateBySchemaAndExtract({
    id: {
      isInt: true,
      toInt: true,
      in: ["params"],
    },
  }),
  jwtAuth,
  async (req: RequestWithValidatedData<{ id: number }>, res) => {
    const { id } = req.validatedData;

    const currentUser = await models.User.findByPk(id, {
      attributes: ["id", "firstName", "bio", "geo", "phone"],
      include: [
        {
          association: "avatars",
          attributes: ["url"],
        },
      ],
    });

    const jsonizedCurrentUser = currentUser.toJSON() as User;

    return res.json({
      ...jsonizedCurrentUser,
      avatars: jsonizedCurrentUser.avatars.map((avatar) => {
        return `http://10.0.2.2:7654/${avatar.url}`;
      }),
    });
  }
);

router.get(
  `${PREFIX}/:id/matches`,
  validateBySchemaAndExtract({
    id: {
      isInt: true,
      toInt: true,
      in: ["params"],
    },
  }),
  jwtAuth,
  async (req: RequestWithValidatedData<{ id: number }>, res) => {
    const { id } = req.validatedData;

    const targetUser = await User.findByPk(id);

    if (!targetUser || !targetUser.geo) {
      console.log("Target user not found or has no location.");
      return res.json([]);
    }

    const query = `
      SELECT id, ST_Distance(geo, ST_GeomFromText(:point)) AS distance
      FROM "Users"
      WHERE id NOT IN (:excludedUserIds)
      ORDER BY distance
      LIMIT 1;  
    `;

    const allMatchedUsers = await models.Match.findAll({
      attributes: ["pairId"],
      where: {
        seekerId: id,
      },
      raw: true,
    });

    const nearestUsers = await sequelize.query(query, {
      replacements: {
        point: `POINT(${targetUser.geo.coordinates[0]} ${targetUser.geo.coordinates[1]})`,
        excludedUserIds: [id, ...allMatchedUsers.map((el) => el.pairId)],
      },
      type: QueryTypes.SELECT,
    });

    const [nearestUser] = nearestUsers;

    if (!nearestUser) {
      return res.json([]);
    }

    //@ts-ignore TODO:
    const currentNearestUser = await models.User.findByPk(nearestUser.id, {
      attributes: ["id", "firstName", "bio", "geo", "phone"],
      include: [
        {
          association: "avatars",
          attributes: ["url"],
        },
      ],
    });

    await models.Match.create({
      seekerId: id,
      pairId: currentNearestUser.id,
    });

    //@ts-ignore TODO:
    const jsonizedCreatedPair = currentNearestUser.toJSON() as User;

    return res.json([
      {
        ...jsonizedCreatedPair,
        avatars: jsonizedCreatedPair.avatars.map((avatar) => {
          return `http://10.0.2.2:7654/${avatar.url}`;
        }),
      },
    ]);
  }
);

enum Swipe {
  Dislike = "Dislike",
  Like = "Like",
  Maybe = "Maybe",
}

router.post(
  `${PREFIX}/swipe-result`,
  jwtAuth,
  validateBySchemaAndExtract({
    pairId: {
      isInt: true,
      toInt: true,
      in: ["body"],
    },
    swipeType: {
      isString: true,
    },
  }),
  async (
    req: RequestWithValidatedData<{ pairId: number; swipeType: Swipe }>,
    res
  ) => {
    const { pairId, swipeType } = req.validatedData;

    const { id: currentUserId } = res.locals.user;

    if (swipeType === Swipe.Maybe) {
      const currentMatch = await models.Match.findOne({
        where: {
          pairId,
          seekerId: currentUserId,
        },
      });

      if (currentMatch) {
        await currentMatch.destroy();
      }
    } else if (swipeType === Swipe.Like) {
      const pairChats = await models.ChatMember.findAll({
        attributes: ["chatId"],
        where: {
          userId: pairId,
        },
        raw: true,
      });

      const currentUserChats = await models.ChatMember.findAll({
        attributes: ["chatId"],
        where: {
          userId: currentUserId,
        },
        raw: true,
      });

      const [commonChatId] = pairChats
        .map((el) => el.chatId)
        .filter((element) =>
          currentUserChats.map((el) => el.chatId).includes(element)
        );

      if (commonChatId) {
        await models.Message.create({
          chatId: commonChatId,
          content: "Привет, давай пообщаемся!",
          authorId: currentUserId,
        });

        socket.emit("new-message", { chatId: commonChatId });
      } else {
        const createdChat = await models.Chat.create({});

        await models.ChatMember.bulkCreate([
          {
            chatId: createdChat.id,
            userId: pairId,
          },
          {
            chatId: createdChat.id,
            userId: currentUserId,
          },
        ]);

        await models.Message.create({
          chatId: createdChat.id,
          content: "Привет, давай пообщаемся!",
          authorId: currentUserId,
        });

        socket.emit("new-message", { chatId: createdChat.id });
      }

      await models.Match.update(
        {
          result: 1,
        },
        {
          where: {
            pairId,
            seekerId: currentUserId,
          },
        }
      );
    } else if (swipeType === Swipe.Dislike) {
      await models.Match.update(
        {
          result: 0,
        },
        {
          where: {
            pairId,
            seekerId: currentUserId,
          },
        }
      );
    }

    return res.sendStatus(HTTP_STATUS_CODES.OK);
  }
);

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const originalFileName = file.originalname;
    const fileExtension = path.extname(originalFileName);

    const newFileName = `${Date.now()}${fileExtension}`;

    cb(null, newFileName);
  },
});

const upload = multer({ storage });

type CreateUserValidatedData = {
  name: string;
  bio: string;
  geo: {
    longitude: number;
    latitude: number;
  };
  sex: number;
  whoToShow: number;
  phone: string;
  id: string | null;
};

router.post(
  PREFIX,
  upload.array("files"),
  async (req: RequestWithValidatedData<CreateUserValidatedData>, res) => {
    // TODO: сделать схему валидации
    const { name, bio, sex, whoToShow, geo, phone, id } =
      req.body as CreateUserValidatedData;

    const files = req.files as any[];

    const [createdUser] = await models.User.upsert({
      ...(Boolean(id) && id !== "undefined" && { id: Number(id) }),
      bio,
      firstName: name,
      geo: Sequelize.fn(
        "ST_GeomFromText",
        //@ts-ignore TODO:
        `POINT(${JSON.parse(geo).longitude} ${JSON.parse(geo).latitude})`
      ) as any,
      phone,
      whoToShow,
      sex,
    });

    await models.Avatar.destroy({
      where: {
        userId: createdUser.id,
      },
    });

    if (files.length > 0) {
      await models.Avatar.bulkCreate(
        files.map((file) => ({
          url: file.path,
          userId: createdUser.id,
        }))
      );
    }

    let token = null;

    if (!Boolean(id) || id === "undefined") {
      token = jwt.sign(
        {
          id: createdUser.id,
          phone: createdUser.phone,
        },
        process.env.SECRET
      );
    }

    console.log("token", token);

    return res.json({ jwt: token });
  }
);

export default router;
