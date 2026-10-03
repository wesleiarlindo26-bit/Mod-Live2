const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const users = new Map();
const rooms = new Map();

io.on("connection", socket => {
  socket.on("join-room", ({ roomId, user }) => {
    if (!roomId) return;
    socket.join(roomId);
    users.set(socket.id, { ...user, socketId: socket.id, roomId });
    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    rooms.get(roomId).add(socket.id);

    const peers = [...rooms.get(roomId)].filter(id => id !== socket.id)
      .map(id => users.get(id)).filter(Boolean);

    socket.emit("room-users", peers);
    socket.to(roomId).emit("user-joined", users.get(socket.id));
  });

  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("chat-message", ({ roomId, message }) => {
    const u = users.get(socket.id);
    if (!u || !roomId || !message) return;
    io.to(roomId).emit("chat-message", {
      id: crypto.randomUUID(),
      message: String(message).slice(0, 4000),
      author: { id: socket.id, name: u.name || "Usuário" },
      time: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    const u = users.get(socket.id);
    if (u?.roomId) {
      rooms.get(u.roomId)?.delete(socket.id);
      socket.to(u.roomId).emit("user-left", { socketId: socket.id });
    }
    users.delete(socket.id);
  });
});

app.get("/api/health", (_, res) => res.json({ ok: true, service: "ModLive" }));
app.use( (_, res) => res.sendFile(path.join(__dirname, "..", "public", "index.html")));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`ModLive online na porta ${PORT}`));