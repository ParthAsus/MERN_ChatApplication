import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import groupRoutes from './routes/group.route.js';
import dotenv from 'dotenv';
import {connectDb} from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from "cors";
import { app, server } from './lib/socket.js';

dotenv.config();
const port = process.env.PORT;
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({extended: true}));


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);




server.listen(port, () => {
  console.log('Server is running on port:' + port);
  connectDb();
})