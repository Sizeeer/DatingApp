import jwt from "jsonwebtoken";
import { omitBy } from "lodash";
import { models } from "../models";
import { HTTP_STATUS_CODES } from "../constants/httpStatusCodes";

export const jwtAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      throw new Error("Токен не передан");
    }

    const { id } = jwt.verify(token, process.env.SECRET) as {
      id: number;
    };

    res.locals.user = await models.User.findByPk(id, {
      rejectOnEmpty: true,
      include: [
        {
          association: "avatars",
        },
      ],
    });

    next();
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json(
      omitBy(
        {
          error: 1,
          message:
            "При проверке подлинности произошла ошибка, пожалуйста войдите ещё раз",
          details:
            process.env.NODE_ENV !== "production" &&
            (error?.toJSON ? error.toJSON() : JSON.stringify(error)),
        },
        (v) => !v
      )
    );
  }
};
