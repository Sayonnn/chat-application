const http = require("http");
const express = require("express");
const webSocket = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 1024;

const app = express();

app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = webSocket(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

let rooms = {};
// reformat the room object to an array
const getRooms =() => {
  return Object.values(rooms).map(room => ({
    id: room.id,
    roomName: room.roomName,
    hostName: room.hostName,
    participants: room.participants
  }));
}

io.on("connection", (socket) => {
  console.log("User Connected\nsocket id: ", socket.id, "\n ");
  // show the new user connected the rooms available
  const values = getRooms();
  socket.emit("rooms", values);

  // ****************************************
  // hosting room
  // ****************************************
  socket.on("createRoom", (datas) => {
    const { roomName, hostName } = datas;

    socket.join(roomName);

    if (!rooms[roomName]) {
      rooms[roomName] = {
        id: socket.id,
        hostName: hostName,
        roomName: roomName,
        participants: [hostName]
      };
    } else {
      rooms[roomName].participants.push(hostName);
    }

    // Broadcast the updated list of rooms to all clients
    const values = getRooms();
    io.emit("rooms", values);

    // Notify all clients in the room about the updated participant list
    io.to(roomName).emit("participants", rooms[roomName].participants);
  });

  // ****************************************
  // joining room
  // ****************************************
  socket.on("joinRoom", (datas) => {
    const { userName, roomName } = datas;

    if (rooms[roomName]) {
      socket.join(roomName);
      socket.broadcast.emit("userJoined", userName); // Notify all clients about the new user

      if (!rooms[roomName].participants.includes(userName)) {
        rooms[roomName].participants.push(userName);

        // Notify all clients in the room about the updated participant list
        io.to(roomName).emit("participants", rooms[roomName].participants);
      }
    }
  });

  socket.on("leftRoom", (datas) => {
    const { userName, roomName } = datas;
    console.log(`User ${userName} left room ${roomName}`);
  
    if (rooms[roomName]) {
       const updatedParts = rooms[roomName].participants.filter(participant => participant !== userName);
      rooms[roomName].participants = updatedParts;
      // User leaves the socket room
      socket.leave(roomName);
      socket.broadcast.emit("userLeft", userName); // Notify all clients about the new user

      // Notify all clients in the room about the updated participant list
      io.to(roomName).emit("participants", updatedParts);
      // io.to(roomName).emit("userLeft", userName);
  
    }
  });
  
  
  
  
  
  
});

server.listen(port, () => {
  console.log("Server is running at port ", port);
});
