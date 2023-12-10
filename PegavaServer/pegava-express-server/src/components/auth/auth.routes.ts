import { Router } from "express";
import { checkSchema } from "express-validator";
import { loginSchema } from "./auth.schemas";
import { validateBySchemaAndExtract } from "../../middlewares/validateBySchemaAndExtract";
import { RequestWithValidatedData } from "../../middlewares/extractValidatedData";

const router = Router();

type LoginValidatedData = {
  phone: string;
};

router.post(
  "/auth/login",
  validateBySchemaAndExtract(loginSchema),
  async (req: RequestWithValidatedData<LoginValidatedData>, res) => {
    const { phone } = req.validatedData;

    console.log("phone", phone);
    return res.json(1);
  }
);

export default router;
