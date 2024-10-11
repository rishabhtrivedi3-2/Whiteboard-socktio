const express = require('express');

const app = express();
const cors = require('cors');
app.use(cors())
const http = require('http');
// const server = http.createServer(app);
var server = app.listen(5000);

const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

const
  rooms = {}; // Store room information (e.g., users)

io.on('connection', (socket) => {

  socket.on('createroom', (roomId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push(socket.id);
    socket.join(roomId);
    // socket.emit('createroom', { userId: socket.id }); // Send user ID to client
    // console.log(roomId)
  });

  socket.on('drawing_event', (data) => {
    socket.broadcast.emit('drawing_event', data); // Broadcast to others in the same room

    console.log( socket.room,data);
    socket.emit('drawing_event',data);
  });

  socket.on('disconnect', () => {
    // console.log('A user disconnected');
    // Remove user from rooms and handle cleanup if needed
  });
});


// app.listen(5001, () => {
//   console.log('server is running on port 3000')
// })
