import { Response, Router } from "express";
import { checkSchema } from "express-validator";
import { loginSchema } from "./auth.schemas";
import { validateBySchemaAndExtract } from "../../middlewares/validateBySchemaAndExtract";
import { RequestWithValidatedData } from "../../middlewares/extractValidatedData";
import { models } from "../../models";
import { HTTP_STATUS_CODES } from "../../constants/httpStatusCodes";
import jwt from "jsonwebtoken";

const router = Router();

const PREFIX = "/auth";

type LoginValidatedData = {
  phone: string;
  oneTimeCode: string;
};

router.post(
  `${PREFIX}/check-one-time-code`,
  validateBySchemaAndExtract(loginSchema),
  async (req: RequestWithValidatedData<LoginValidatedData>, res: Response) => {
    //TODO: сделать хранение oneTimeCode в редисе для телефона если успеваит буду
    const { phone, oneTimeCode } = req.validatedData;

    //TODO: проверку redis сделать
    const isOneTimeCodeValid = true;

    if (!isOneTimeCodeValid) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        readyToRegister: false,
      });
    }

    const currentUser = await models.User.findOne({
      where: {
        phone,
      },
    });

    if (!currentUser) {
      return res.json({
        readyToRegister: true,
      });
    }

    const token = jwt.sign(
      {
        id: currentUser.id,
        phone: currentUser.phone,
      },
      process.env.SECRET
    );

    return res.json({
      jwt: token,
    });
  }
);

export default router;
