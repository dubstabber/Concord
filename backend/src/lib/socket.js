import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "development" ? ["http://localhost:5173"] : true,
    credentials: true,
  },
});

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

function broadcastOnlineUsers() {
  const onlineUsers = Object.keys(userSocketMap);
  console.log("Broadcasting online users:", onlineUsers);
  io.emit("getOnlineUsers", onlineUsers);
}

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    console.log(`User ${userId} is now online with socket ${socket.id}`);
    userSocketMap[userId] = socket.id;

    broadcastOnlineUsers();
  }

  socket.on("disconnect", () => {
    console.log("A user disconnected: ", socket.id);

    if (userId) {
      console.log(`User ${userId} is now offline`);
      delete userSocketMap[userId];

      broadcastOnlineUsers();
    }
  });
});

export { io, app, server };
