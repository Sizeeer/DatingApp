import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { HTTP_STATUS_CODES } from "../constants/httpStatusCodes";

// коды из multer
const errorMessages = {
  LIMIT_PART_COUNT: "Too many parts",
  LIMIT_FILE_SIZE: "Размер файла превышает 200 мб",
  LIMIT_FILE_COUNT: "Файлов слишком много",
  LIMIT_FIELD_KEY: "Слишком длинное название поля",
  LIMIT_FIELD_VALUE: "Слишком длинное значение поля",
  LIMIT_FIELD_COUNT: "Слишком много полей",
  LIMIT_UNEXPECTED_FILE: "Непредвиденный файл",
};

type SpecificExpressError = Error & {
  statusCode?: HTTP_STATUS_CODES;
};

const exceptionHandler = (
  err: SpecificExpressError,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __: NextFunction
) => {
  if (err) {
    res.status(err.statusCode || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);

    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.json({
        error: 1,
        // @ts-ignore TODO:
        message: errorMessages[err.code] || "Ошибка сервера при загрузке файла",
      });
    }

    return res.json({
      error: 1,
      message: err.toString(),
    });
  }
};

export default exceptionHandler;
