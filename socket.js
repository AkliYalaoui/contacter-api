import { Server } from "socket.io";

const socketIo = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT,
    },
  });

  io.on("connection", (socket) => {
    //conversations and messages
    socket.on("join-conversation", (id) => socket.join(id));
    socket.on("send-message", (conversationId, message) =>
      socket.broadcast.to(conversationId).emit("receive-message", message)
    );
    socket.on("user-typing", (id) =>
      socket.broadcast.to(id).emit("typing", "typing")
    );
    socket.on("user-not-typing", (id) =>
      socket.broadcast.to(id).emit("not-typing", "")
    );

    //rooms
    socket.on("join-room", (id) => {
      socket.join(id);
    });
    socket.on("join-post", (id) => {
      socket.join(id);
    });

    //requests and friends
    socket.on("send-request", (id, request) => {
      socket.broadcast.to(id).emit("receive-request", id, request);
    });

    //Notifications
    socket.on("send-notification", (id, notification) => {
      socket.broadcast.to(id).emit("receive-notification", id, notification);
    });

    //comments and likes for a post
    socket.on("send-comment", (id, comment) => {
      console.log(id);
      socket.broadcast.to(id).emit("receive-comment", id, comment);
    });
    socket.on("send-like", (id, like) => {
      console.log(id);
      socket.broadcast.to(id).emit("receive-like", id, like);
    });

    //video calls
    socket.on("call-user", ({ userTocall, signalData, from, name }) => {
      socket.broadcast
        .to(userTocall)
        .emit("user-calling", { signal: signalData, from, name });
    });

    socket.on("answer-call", (data) => {
      socket.broadcast.to(data.to).emit("call-accepted", data.signal);
    });
    socket.on("call-ended", (from) => {
      socket.broadcast.to(from).emit("call-canceled", from);
    });
  });
};

export default socketIo;
