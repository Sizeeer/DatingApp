"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const exceptionHandler_1 = __importDefault(require("./middlewares/exceptionHandler"));
const zlib_1 = require("zlib");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const port = process.env.PORT || 7654;
const app = (0, express_1.default)();
app.use(require("helmet")());
app.use((0, compression_1.default)({
    threshold: "10kb",
    level: zlib_1.constants.Z_DEFAULT_LEVEL,
    memLevel: zlib_1.constants.Z_MAX_MEMLEVEL,
    filter: (req, res) => {
        // не сжимать запросы с этим заголовком
        if (req.headers["x-no-compression"]) {
            return false;
        }
        // fallback to standard filter function
        return compression_1.default.filter(req, res);
    },
}));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)());
app.use("*", (_, res) => res.status(404).json({ error: 1, message: "Not found" }));
app.use(exceptionHandler_1.default);
const server = http_1.default.createServer(app);
server.listen(port, () => {
    console.log("start server");
});
//# sourceMappingURL=index.js.map