import "express-async-errors";

import http from "http";
import express from "express";
import cors from "cors";
import exceptionHandler from "./middlewares/exceptionHandler";
import "dotenv/config";
import usersRouter from "./components/user/user.routes";
import authRouter from "./components/auth/auth.routes";
import chatRouter from "./components/chat/chat.routes";
import ngrok from "@ngrok/ngrok";
import path from "path";

const port = process.env.PORT || 7654;

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

const PREFIX = "/api/v1";

app.use(PREFIX, usersRouter, authRouter, chatRouter);

app.use("*", async (_, res) => {
  return res.status(404).json({ error: 1, message: "Not found" });
});

app.use(exceptionHandler);

const server = http.createServer(app);

server.listen(port, () => {
  console.log("start server on port" + " " + port);

  // (async () => {
  //   const listener = await ngrok.forward({
  //     proto: "http",
  //     addr: port,
  //     authtoken: "process.env.NGROK_AUTHTOKEN",
  //   });

  //   console.log("url", listener.url());
  // })();
});
