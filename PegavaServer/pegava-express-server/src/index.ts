import "express-async-errors";

import http from "http";
import express from "express";
import cors from "cors";
import exceptionHandler from "./middlewares/exceptionHandler";
import "dotenv/config";
import { models } from "./models";
import usersRouter from "./components/user/user.routes";
import authRouter from "./components/auth/auth.routes";

const port = process.env.PORT || 7654;

const app = express();

app.use(cors());

app.use(express.json());

const PREFIX = "/api/v1";

app.use(PREFIX, usersRouter, authRouter);

app.use("*", async (_, res) => {
  return res.status(404).json({ error: 1, message: "Not found" });
});

app.use(exceptionHandler);

const server = http.createServer(app);

server.listen(port, () => {
  console.log("start server");
});
