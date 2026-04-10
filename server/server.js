require("dotenv").config({ path: __dirname + '/.env' });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const chatRoutes = require("./routes/chat");
const Message = require("./models/Message");

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
app.use(express.json());

// Database connection
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);

// Socket.io for Real-Time Chat
const userSockets = {}; // Map to track active sockets: userId -> socketId

io.on("connection", (socket) => {
  // Client authenticates to map their socket using user._id
  socket.on("register", (userId) => {
    userSockets[userId] = socket.id;
  });

  // Sending message event
  socket.on("send_message", async ({ senderId, receiverId, text }) => {
    try {
      const msg = await Message.create({ sender: senderId, receiver: receiverId, text });
      // Emit to receiver if online
      if(userSockets[receiverId]) {
        io.to(userSockets[receiverId]).emit("receive_message", msg);
      }
      // Emit back to sender as confirmation
      socket.emit("receive_message", msg);
    } catch(err) {
      console.error("Socket error saving message", err);
    }
  });

  socket.on("disconnect", () => {
    // Remove from map
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
