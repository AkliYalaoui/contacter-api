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

    //requests and friends
    socket.on("join-requests", (id) => {
      socket.join(id);
    });
    socket.on("send-request", (id, request) => {
      socket.broadcast.to(id).emit("receive-request", id, request);
    });

    //Notifications
    socket.on("join-notifications", (id) => {
      socket.join(id);
    });
    socket.on("send-notification", (id, notification) => {
      socket.broadcast.to(id).emit("receive-notification", id, notification);
    });
  });
};

export default socketIo;
