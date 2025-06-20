import express from 'express'
import dotenv from 'dotenv'
import authRouter from './routes/auth.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import messageRouter from './routes/message.route.js';
import cors from "cors";
import { app, server } from './lib/socket.js';
import groupRouter from './routes/group.route.js';
import path from 'path';

dotenv.config();
// const app = express();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: "https://lynkup-chat.vercel.app",
    credentials: true,
}))

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);
app.use("/api/group", groupRouter);

// if(process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, '../client/dist')));
//     app.get(/(.*)/, (req, res) => {
//         res.sendFile(path.join(__dirname, '../client/dist/index.html'));
//     });
// }

app.get('/', (req, res) => {
    res.send('Hello');
});

const startServer = async () => {
    try {
      await connectDB(); // ✅ Wait for DB to connect first
  
      server.listen(PORT, () => {
        console.log(`Server running at PORT ${PORT}`);
      });
    } catch (err) {
      console.error("❌ Failed to connect to DB:", err.message);
      process.exit(1); // stop the server if DB connection fails
    }
  };
  
  startServer(); // ⬅️ Call the async init function
  

// server.listen(PORT, () => {
//     console.log(`Server running at PORT ${PORT}`);
//     connectDB();
// });