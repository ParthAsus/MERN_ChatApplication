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

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  Group.find({ members: userId }).then((groups) => {
    groups.forEach((group) => {
      socket.join(group._id.toString());
    });
  });

  // Room handling
  socket.on('room:create', (data) => {
    const { to, roomId, from, offer } = data;
    
    // Join the room
    socket.join(roomId);
    
    // Get receiver socket ID
    const receiverSocketId = userSocketMap[to];
    if (!receiverSocketId) {
      console.log(`User ${to} is offline`);
      return;
    }
    
    // Send invitation to join room
    io.to(receiverSocketId).emit('room:invitation', {
      roomId,
      from,
      offer
    });
  });
  
  socket.on('room:join', (data) => {
    const { roomId, from, answer } = data;
    
    socket.join(roomId);
    
    // Notify everyone in the room that this user joined
    socket.to(roomId).emit('room:joined', {
      roomId,
      user: from,
      answer
    });
  });

  
  socket.on('room:leave', (data) => {
    const { roomId, to } = data;
    
    socket.leave(roomId);
    
    // Notify the other user
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('room:left', { roomId });
    }
    
    console.log(`User left room ${roomId}`);
  });

  // WebRTC Signaling

  // socket.on('user:call', (data) => {
  //   const {to, offer, roomId} = data;

  //   const receiverSocketId = userSocketMap[to];
  //   if(!receiverSocketId) {
  //     console.log(`User ${to} is offline`);
  //   };

  //   socket.join(roomId);
  //   io.to(receiverSocketId).socketsJoin(roomId);

  //   io.to(receiverSocketId).emit('incoming:call', {from: socket.id, offer, roomId});
  //   console.log(`User ${socket.id} started a call with ${to} in room ${roomId}`);
  //   // socket.to(userSocketMap[to]).emit('incoming:call', {from: userId, offer});
  // });

  // socket.on('call:accepted', (data) => {
  //   const {to, answer} = data;
  //   socket.to(userSocketMap[to]).emit('call:accepted', {from: userId, answer});
  // });

  // socket.on('peerConnection:nego:needed', (data) => {
  //   const {to, offer} = data;
  //   socket.to(userSocketMap[to]).emit('peerConnection:nego:incoming', {from: userId, offer});
  // });

  // socket.on('peerConnection:nego:acepted', (data) => {
  //   const {to, answer} = data;
  //   socket.to(userSocketMap[to]).emit('peerConnection:nego:completed', {from: userId, answer});
  // });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, app };
