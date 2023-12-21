import { Router } from "express";
import path from "path";

import multer from "multer";
import { validateBySchemaAndExtract } from "../../middlewares/validateBySchemaAndExtract";
import { RequestWithValidatedData } from "../../middlewares/extractValidatedData";
import { models, sequelize } from "../../models";
import { jwtAuth } from "../../middlewares/jwt";
import jwt from "jsonwebtoken";

const router = Router();

const PREFIX = "/users";

router.get(`${PREFIX}/me`, jwtAuth, (req, res) => {
  return res.json(res.locals.user);
});

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
};

router.post(
  PREFIX,
  upload.array("files"),
  async (req: RequestWithValidatedData<CreateUserValidatedData>, res) => {
    // TODO: сделать схему валидации
    const { name, bio, sex, whoToShow, geo, phone } =
      req.body as CreateUserValidatedData;

    const files = req.files as any[];

    const createdUser = await models.User.create({
      bio,
      firstName: name,
      geo: {
        type: "Point",
        coordinates: [geo[0].longitude, geo[0].latitude],
      },
      phone,
      whoToShow,
      sex,
    });

    await models.Avatar.bulkCreate(
      files.map((file) => ({
        url: file.path,
        userId: createdUser.toJSON().id,
      }))
    );

    const token = jwt.sign(
      {
        id: createdUser.id,
        phone: createdUser.phone,
      },
      process.env.SECRET
    );

    return res.json({ jwt: token });
  }
);

export default router;
