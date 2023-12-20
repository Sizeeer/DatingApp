import { Response, Router } from "express";
import { Schema, checkSchema } from "express-validator";
import { loginSchema } from "./auth.schemas";
import { validateBySchemaAndExtract } from "../../middlewares/validateBySchemaAndExtract";
import { RequestWithValidatedData } from "../../middlewares/extractValidatedData";
import { models } from "../../models";
import { HTTP_STATUS_CODES } from "../../constants/httpStatusCodes";
import jwt from "jsonwebtoken";
import { OneTimeCodeRedisSource } from "../../lib/redis/oneTimeCodeRedisSource";
import { generateFourDigitsOtp } from "../../services/otp.service";

const router = Router();

const PREFIX = "/auth";

type LoginValidatedData = {
  phone: string;
  oneTimeCode: string;
};

const oneTimeCodesRedisSource = OneTimeCodeRedisSource.getInstance();

const sendOneTimeCodeSchema: Schema = {
  phone: {
    isString: true,
  },
};

type SendOneTimeCodeValidatedData = {
  phone: string;
};

router.post(
  `${PREFIX}/send-one-time-code`,
  validateBySchemaAndExtract(sendOneTimeCodeSchema),
  async (req: RequestWithValidatedData<SendOneTimeCodeValidatedData>, res) => {
    const { phone } = req.validatedData;

    const newOneTimeCode = generateFourDigitsOtp();

    await oneTimeCodesRedisSource.upsert(phone, newOneTimeCode);

    return res.json(newOneTimeCode);
  }
);

router.post(
  `${PREFIX}/check-one-time-code`,
  validateBySchemaAndExtract(loginSchema),
  async (req: RequestWithValidatedData<LoginValidatedData>, res: Response) => {
    const { phone, oneTimeCode } = req.validatedData;

    const savedOneTimeCode = await oneTimeCodesRedisSource.getByKey(phone);

    const isOneTimeCodeValid = savedOneTimeCode === oneTimeCode;

    if (!isOneTimeCodeValid) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        readyToRegister: false,
      });
    }

    await oneTimeCodesRedisSource.removeKey(phone);

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
