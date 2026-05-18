// server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const connectDB = require("./db");
const Project = require("./models/Project");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const JWT_SECRET = process.env.JWT_SECRET || "tandem_secret_key";
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Tandem WebSocket Server is running.");
});

// In-memory room tracking
const rooms = {};

// Socket.io real-time handling
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("joinRoom", async ({ docId, token }) => {
    try {
      // First, leave any previous room the socket was in
      if (socket.currentRoom) {
        socket.leave(socket.currentRoom);
        if (rooms[socket.currentRoom]) {
          rooms[socket.currentRoom] = rooms[socket.currentRoom].filter((u) => u.socketId !== socket.id);
          io.to(socket.currentRoom).emit("collaboratorsUpdate", rooms[socket.currentRoom]);
        }
      }

      let user = { socketId: socket.id, id: socket.id, username: "Guest", role: "viewer" };
      
      // Verify user if token is provided
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          const User = require("./models/User");
          const dbUser = await User.findById(decoded.id);
          if (dbUser) {
            user = { socketId: socket.id, id: dbUser._id, username: dbUser.username, role: "viewer" };
          }
        } catch (err) {
          console.log("Invalid token in socket connection");
        }
      }

      socket.join(docId);
      socket.currentRoom = docId;

      // Fetch project to determine role
      const project = await Project.findById(docId);
      if (project) {
        if (user.id.toString() === project.owner.toString()) {
          user.role = "owner";
        } else {
          const collaborator = project.collaborators.find(c => c.user.toString() === user.id.toString());
          if (collaborator) user.role = collaborator.role;
        }
      }

      socket.userSession = user;

      if (!rooms[docId]) rooms[docId] = [];
      // Remove any existing entry for this socket to prevent duplicates
      rooms[docId] = rooms[docId].filter((u) => u.socketId !== socket.id);
      rooms[docId].push(user);

      console.log(`${user.username} joined room ${docId} as ${user.role}`);
      io.to(docId).emit("collaboratorsUpdate", rooms[docId]);

      // Load project content
      if (project) {
        socket.emit("loadDocument", project.content);
      }

    } catch (err) {
      console.error("Socket error on joinRoom:", err);
    }
  });

  // Handle content updates
  socket.on("sendChanges", async (newContent) => {
    const docId = socket.currentRoom;
    const user = socket.userSession;

    if (!docId || !user) return;

    // Only allow if user is owner or editor
    if (user.role === "owner" || user.role === "editor") {
      socket.broadcast.to(docId).emit("receiveChanges", newContent);
      await Project.findByIdAndUpdate(docId, { content: newContent });
    } else {
      socket.emit("error", "You do not have permission to edit this document");
    }
  });

  // Handle manual room leave
  socket.on("leaveRoom", () => {
    const docId = socket.currentRoom;
    if (docId) {
      if (rooms[docId]) {
        rooms[docId] = rooms[docId].filter((u) => u.socketId !== socket.id);
        io.to(docId).emit("collaboratorsUpdate", rooms[docId]);
      }
      socket.leave(docId);
    }
    socket.currentRoom = null;
    socket.userSession = null;
  });

  socket.on("disconnect", () => {
    const docId = socket.currentRoom;
    if (docId && rooms[docId]) {
      rooms[docId] = rooms[docId].filter((u) => u.socketId !== socket.id);
      io.to(docId).emit("collaboratorsUpdate", rooms[docId]);
    }
    
    // Safety check for any other rooms
    for (const rId in rooms) {
      const initialLength = rooms[rId].length;
      rooms[rId] = rooms[rId].filter((u) => u.socketId !== socket.id);
      if (rooms[rId].length !== initialLength) {
        io.to(rId).emit("collaboratorsUpdate", rooms[rId]);
      }
    }

    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
