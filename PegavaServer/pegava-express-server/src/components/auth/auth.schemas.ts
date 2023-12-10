import { Schema } from "express-validator";

export const loginSchema: Schema = {
  phone: {
    isString: true,
  },
};
