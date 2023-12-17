import { Router } from "express";
import path from "path";

import multer from "multer";
import { validateBySchemaAndExtract } from "../../middlewares/validateBySchemaAndExtract";
import { RequestWithValidatedData } from "../../middlewares/extractValidatedData";
import { models, sequelize } from "../../models";

const router = Router();

const PREFIX = "/users";

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
  country: string;
  sex: number;
  whoToShow: number;
  phone: string;
};

router.post(
  PREFIX,
  upload.array("files"),
  validateBySchemaAndExtract({
    name: {
      isString: true,
      in: ["body"],
    },
    bio: {
      isString: true,
      in: ["body"],
    },
    sex: {
      isInt: true,
      toInt: true,
      in: ["body"],
    },
    whoToShow: {
      isInt: true,
      toInt: true,
      in: ["body"],
    },
    country: {
      isString: true,
      in: ["body"],
    },
    phone: {
      isString: true,
      in: ["body"],
    },
  }),
  async (req: RequestWithValidatedData<CreateUserValidatedData>, res) => {
    const { name, bio, sex, whoToShow, country, phone } = req.validatedData;
    const files = req.files as any[];

    await sequelize.transaction(async (transaction) => {
      const createdUser = await models.User.create(
        {
          bio,
          firstName: name,
          geo: country,
          phone,
          whoToShow,
          sex,
        },
        {
          transaction,
          returning: true,
        }
      );

      await models.Avatar.bulkCreate(
        files.map((file) => ({
          url: file.path,
          userId: createdUser.toJSON().id,
        })),
        {
          transaction,
        }
      );

      res.json(createdUser);
    });
  }
);

export default router;
