const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const webSocket = require("socket.io");
const http = require("http")
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 1024;

const server = http.createServer(app);
const io = webSocket(server, { 
  cors: {
    origin: "http://localhost:3000",
    method: ["PUT", "POST", "DELETE", "GET"]
  }
})

const rooms = {};

const getRooms = () => {
  return Object.values(rooms).map((room) => ({
    room_name: room.room_name,
    host_name: room.host_name,
    room_pass: room.room_pass,
    room_state: room.room_state,
    participants: [room.host_name]
  }))
}

io.on("connection", (socket) => {
  console.log("New User Connected");

  // Send the list of all rooms when a user connects
  const roomList = getRooms();
  io.emit("rooms", roomList);

  // Get participants
  socket.on("getParticipants", (datas) => {
    const { room } = datas;
    if (rooms[room]) {
      socket.broadcast.to(room).emit("participants", rooms[room].participants);
    }
  });


  // Host room 
  socket.on("hostRoom", (datas) => {
    const { room, user,pass, state } = datas;
    // join host socket 
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        host_name: user,
        room_name: room,
        room_pass:pass,
        room_state:state,
        participants: [user]  // Include the host in participants
      };
    }

    const roomList = getRooms();
    io.emit("rooms", roomList);
  });

  socket.on("joinRoom", (datas) => {
    const { room, user } = datas;
    console.log(`User ${user} Joined room ${room}`);

    if (rooms[room]) {
      socket.join(room);

      // Notify other users in the room (not including the sender)
      socket.broadcast.to(room).emit("userJoined", user);

      const nameFound = rooms[room].participants.indexOf(user);
      if (nameFound === -1) {
        rooms[room].participants.push(user);

        // Notify all clients in the room about the updated participant list
        io.to(room).emit("participants", rooms[room].participants);
      }
    }
  });
 
  // Left room
  socket.on("leftRoom", (datas) => {
    const { room, user } = datas;
    console.log(`User ${user} left room ${room}`);

    if (rooms[room]) {
      socket.leave(room); 
      socket.broadcast.to(room).emit("userLeft", user);

      rooms[room].participants = rooms[room].participants.filter((prevUser) => prevUser !== user);
      io.to(room).emit("participants", rooms[room].participants);

      if (rooms[room].participants.length === 0) {
        delete rooms[room];
        const roomList = getRooms();
        io.emit("rooms", roomList);  
      }
    }
  });
  // handling incoming messages from anyone and broadcast it to anyone on the room
  socket.on("sendMessage", (datas) => {
    const { user, room, message } = datas;
    // check if room exist
    if (rooms[room]) {

      // check if user is member of room
      if (rooms[room].participants.includes(user)) {

        // send the message to all socket members of the room including the sender
        io.to(room).emit("messageSent", { user, message, room });
      }
    }
  })

});




server.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})


