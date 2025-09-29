const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

io.on("connection", (socket) => {
  socket.on("joinGame", ({ username }) => {
    let roomId = null;
    for (const [id, players] of Object.entries(rooms)) {
      if (players.length < 2) {
        roomId = id;
        players.push({ id: socket.id, username, choice: null });
        break;
      }
    }

    if (!roomId) {
      roomId = `room-${Object.keys(rooms).length + 1}`;
      rooms[roomId] = [{ id: socket.id, username, choice: null }];
    }
    socket.join(roomId);

    io.to(socket.id).emit("roomJoined", { roomId });

    if (rooms[roomId].length === 2) {
      io.to(roomId).emit("roomFull", {
        players: rooms[roomId].map((p) => p.username),
      });
    }

    socket.emit("joinedRoom", { rooms });
  });

  socket.on("makeChoice", ({ choice }) => {
    let roomId = null;
    for (const [id, players] of Object.entries(rooms)) {
      const player = players.find((p) => p.id === socket.id);
      if (player) {
        player.choice = choice;
        roomId = id;
        break;
      }
    }

    if (roomId) {
      const players = rooms[roomId];
      if (players.every((p) => p.choice)) {
        const [p1, p2] = players;

        io.to(roomId).emit("gameResult", {
          p1,
          p2
        });

        players.forEach((p) => (p.choice = null));
      }
    }
  });

  socket.on("disconnect", () => {
    for (const [roomId, players] of Object.entries(rooms)) {
        const index = players.findIndex((p) => p.id === socket.id);
        if (index !== -1) {
            players.splice(index, 1);
            io.to(roomId).emit("roomLeft");
            if (players.length === 0) {
                delete rooms[roomId];
            }
            break;
        }
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
