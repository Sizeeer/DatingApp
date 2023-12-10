import type { NextFunction, Request, Response } from "express";
import type { ValidationError } from "express-validator";
import { validationResult } from "express-validator";
import { HTTP_STATUS_CODES } from "../constants/httpStatusCodes";

const errorFormatter = ({ msg, ...rest }: ValidationError) => ({
  ...rest,
  msg: msg === "Invalid value" ? "Некорректное значение" : msg,
});

export const getValidationErrors = (req: Request) =>
  validationResult(req).formatWith(errorFormatter);

// TODO: rename handleValidationErrors
const validateErrorsHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = getValidationErrors(req);
  if (errors.isEmpty()) {
    next();
  } else {
    return res
      .status(HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY)
      .json(errors.array());
  }
};

export default validateErrorsHandler;
