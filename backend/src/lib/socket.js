// import { Server } from "socket.io";
// import http from 'http';
// import express from 'express';

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173"],
//     credentials: true
//   }
// });

// io.on("connection", (socket) => {
//   console.log('A user connected', socket.id);

//   socket.on("disconnect", () => {
//     console.log('A user disconnected', socket.id);
//   })
// })

// export {io, server, app};

import { Server } from "socket.io"; 
import http from "http";
import express from "express";
import Group from "../models/group.model.js";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

export function getReceiverSocketId(userId){
  return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  Group.find({members: userId}).then((groups) => {
    groups.forEach((group) => {
      socket.join(group._id.toString());    
    })
  })

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, app };
