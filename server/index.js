import express from 'express'
import dotenv from 'dotenv'
import authRouter from './routes/auth.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import messageRouter from './routes/message.route.js';
import cors from "cors";
import { app, server } from './lib/socket.js';

dotenv.config();
// const app = express();

const PORT = process.env.PORT;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

server.listen(PORT, () => {
    console.log(`Server running at PORT ${PORT}`);
    connectDB();
});