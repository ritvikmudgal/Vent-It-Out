require("dotenv").config({ path: __dirname + '/.env' });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const passport = require("passport");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const chatRoutes = require("./routes/chat");
const googleAuthRoutes = require("./routes/googleAuth");
const Message = require("./models/Message");
const GroupMessage = require("./models/GroupMessage");
const Group = require("./models/Group");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" })); // Increased for base64 avatar uploads
app.use(passport.initialize());

// Database connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("CRITICAL: MONGO_URI is not defined in environment variables.");
}
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/auth", googleAuthRoutes); // Google OAuth at /auth/google

// Ping route to keep backend alive
app.get("/api/ping", (req, res) => {
  res.status(200).send("pong");
});

// Socket.io for Real-Time Chat
const userSockets = {}; // userId -> socketId

io.on("connection", (socket) => {
  // Register user
  socket.on("register", (userId) => {
    userSockets[userId] = socket.id;
  });

  // ── DM Messages ──
  socket.on("send_message", async ({ senderId, receiverId, text }) => {
    try {
      const msg = await Message.create({ sender: senderId, receiver: receiverId, text });
      if (userSockets[receiverId]) {
        io.to(userSockets[receiverId]).emit("receive_message", msg);
      }
      socket.emit("receive_message", msg);
    } catch (err) {
      console.error("Socket error saving message", err);
    }
  });

  // ── Typing indicators ──
  socket.on("typing", ({ senderId, receiverId }) => {
    if (userSockets[receiverId]) {
      io.to(userSockets[receiverId]).emit("user_typing", { userId: senderId });
    }
  });

  socket.on("stop_typing", ({ senderId, receiverId }) => {
    if (userSockets[receiverId]) {
      io.to(userSockets[receiverId]).emit("user_stop_typing", { userId: senderId });
    }
  });

  // ── Group Chat ──
  socket.on("join_group", (groupId) => {
    socket.join(`group_${groupId}`);
  });

  socket.on("send_group_message", async ({ groupId, senderId, text }) => {
    try {
      const msg = await GroupMessage.create({ group: groupId, sender: senderId, text });
      const populated = await GroupMessage.findById(msg._id)
        .populate("sender", "username _id avatarId");
      io.to(`group_${groupId}`).emit("receive_group_message", populated);
    } catch (err) {
      console.error("Group message error", err);
    }
  });

  socket.on("group_typing", ({ groupId, senderId, username }) => {
    socket.to(`group_${groupId}`).emit("group_user_typing", { userId: senderId, username });
  });

  socket.on("group_stop_typing", ({ groupId, senderId }) => {
    socket.to(`group_${groupId}`).emit("group_user_stop_typing", { userId: senderId });
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of Object.entries(userSockets)) {
      if (socketId === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
