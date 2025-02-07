import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import dotenv from 'dotenv';
import {connectDb} from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from "cors";

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))


app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
const port = process.env.PORT;


app.listen(port, () => {
  console.log('Server is running on port:' + port);
  connectDb();
})