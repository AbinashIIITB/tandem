// server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");
const Document = require("./models/Document");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});


app.use(cors());
app.use(express.json());

// ✅ Health check
app.get("/", (req, res) => {
  res.send("🟢 Tandem WebSocket Server is running.");
});

// 🧠 In-memory room tracking (replace with Redis for production)
const rooms = {};

// 🔌 Socket.io real-time handling
io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  socket.on("joinRoom", async ({ docId, username }) => {
    const trimmedUsername = username.trim();
    socket.join(docId);

    const user = { id: socket.id, username: trimmedUsername };
    if (!rooms[docId]) rooms[docId] = [];

    // Avoid duplicate socket entries
    if (!rooms[docId].some((u) => u.id === socket.id)) {
      rooms[docId].push(user);
    }

    console.log(`${trimmedUsername} joined room ${docId}`);
    io.to(docId).emit("collaboratorsUpdate", rooms[docId]);

    // 📄 Load or create document in DB
    let document = await Document.findById(docId);
    if (!document) {
      document = await Document.create({ _id: docId, content: {} });
    }

    // Send initial content to this user only
    socket.emit("loadDocument", document.content);

    // 🔄 Handle content updates
    socket.on("sendChanges", async (newContent) => {
      socket.broadcast.to(docId).emit("receiveChanges", newContent);
      await Document.findByIdAndUpdate(docId, { content: newContent });
    });

    // 🔚 Handle manual room leave
    socket.on("leaveRoom", () => {
      if (rooms[docId]) {
        rooms[docId] = rooms[docId].filter((u) => u.id !== socket.id);
        io.to(docId).emit("collaboratorsUpdate", rooms[docId]);
      }
      socket.leave(docId);
    });
  });

  // 🔌 Handle disconnect cleanup
  socket.on("disconnect", () => {
    for (const docId in rooms) {
      const originalLength = rooms[docId].length;
      rooms[docId] = rooms[docId].filter((u) => u.id !== socket.id);
      if (rooms[docId].length !== originalLength) {
        io.to(docId).emit("collaboratorsUpdate", rooms[docId]);
      }
    }
    console.log("❌ User disconnected:", socket.id);
  });
});

// 🌐 Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
