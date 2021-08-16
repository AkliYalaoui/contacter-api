import express from "express";
import mongoose from "mongoose";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import fileUploader from "express-fileupload";
import AuthRoutes from "./routes/AuthRouter.js";
import UserRoutes from "./routes/UserRouter.js";
import FriendRoutes from "./routes/FriendRouter.js";
import ConversationRoutes from "./routes/ConversationRouter.js";
import socketIo from "./socket.js";

dotenv.config();
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const DBURI = process.env.DBURI;

mongoose
  .connect(DBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((_) => {
    console.log("Connected to the databse successfully");
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(fileUploader());

    app.use("/api/auth", AuthRoutes);
    app.use("/api/users", UserRoutes);
    app.use("/api/friends", FriendRoutes);
    app.use("/api/conversations", ConversationRoutes);

    const server = http.createServer(app);
    socketIo(server);
    server.listen(PORT, HOST, (_) =>
      console.log(`Server up and running on ${HOST}:${PORT}`)
    );
  })
  .catch((err) => {
    console.log(err);
    console.log("Couldn't connect to the database");
  });
