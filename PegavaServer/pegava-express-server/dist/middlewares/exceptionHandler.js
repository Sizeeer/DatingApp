"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const httpStatusCodes_1 = require("../constants/httpStatusCodes");
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
const exceptionHandler = (err, _, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
__) => {
    if (err) {
        res.status(err.statusCode || httpStatusCodes_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        if (err instanceof multer_1.default.MulterError) {
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
exports.default = exceptionHandler;
//# sourceMappingURL=exceptionHandler.js.map