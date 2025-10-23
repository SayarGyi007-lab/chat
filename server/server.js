import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDb } from './lib/db.js';
import userRouter from './routes/user.routes.js';
import messageRouter from './routes/message.routes.js';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

// --- SOCKET.IO SETUP ---
export const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true
  }
});

// store online users
export const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// --- CORS SETUP ---
const whitelist = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL
];

const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: false, // ❌ not using cookies
    allowedHeaders: ["Content-Type", "Authorization", "token"], // ✅ allow your custom header
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  };

app.use(cors(corsOptions));
app.use(express.json({ limit: "4mb" }));

// --- ROUTES ---
app.use("/api/status", (req, res) => {
  res.send("Server is live");
});

app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

// --- DATABASE ---
await connectDb();

// --- SERVER LISTEN ---
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log("Server running on PORT: " + PORT);
  });
}

export default server;
