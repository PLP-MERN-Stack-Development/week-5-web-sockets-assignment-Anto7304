// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and messages
const users = {};
const messages = {}; // { roomName: [messages] }
const typingUsers = {}; // { roomName: { socketId: username } }

// Helper to get messages for a room
function getRoomMessages(room) {
  if (!messages[room]) messages[room] = [];
  return messages[room];
}

// Helper to get typing users for a room
function getRoomTyping(room) {
  if (!typingUsers[room]) typingUsers[room] = {};
  return typingUsers[room];
}

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Track user's current room
  let currentRoom = 'General';

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    socket.join(currentRoom);
    io.to(currentRoom).emit('user_list', getUsersInRoom(currentRoom));
    io.to(currentRoom).emit('user_joined', { username, id: socket.id, room: currentRoom });
    console.log(`${username} joined the chat in room ${currentRoom}`);
  });

  // Handle room change
  socket.on('join_room', (room) => {
    socket.leave(currentRoom);
    // Remove from typing in old room
    if (getRoomTyping(currentRoom)[socket.id]) {
      delete getRoomTyping(currentRoom)[socket.id];
      io.to(currentRoom).emit('typing_users', Object.values(getRoomTyping(currentRoom)));
    }
    socket.join(room);
    currentRoom = room;
    io.to(currentRoom).emit('user_list', getUsersInRoom(currentRoom));
    io.to(currentRoom).emit('user_joined', { username: users[socket.id]?.username, id: socket.id, room: currentRoom });
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const room = messageData.room || currentRoom;
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      room,
    };
    getRoomMessages(room).push(message);
    if (getRoomMessages(room).length > 100) {
      getRoomMessages(room).shift();
    }
    io.to(room).emit('receive_message', message);
    // Emit notification event
    io.to(room).emit('notify_message', message);
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    const room = currentRoom;
    if (users[socket.id]) {
      const username = users[socket.id].username;
      if (isTyping) {
        getRoomTyping(room)[socket.id] = username;
      } else {
        delete getRoomTyping(room)[socket.id];
      }
      io.to(room).emit('typing_users', Object.values(getRoomTyping(room)));
    }
  });

  // Handle private messages (not room-scoped)
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.to(currentRoom).emit('user_left', { username, id: socket.id, room: currentRoom });
      console.log(`${username} left the chat in room ${currentRoom}`);
    }
    delete users[socket.id];
    if (getRoomTyping(currentRoom)[socket.id]) {
      delete getRoomTyping(currentRoom)[socket.id];
      io.to(currentRoom).emit('typing_users', Object.values(getRoomTyping(currentRoom)));
    }
    io.to(currentRoom).emit('user_list', getUsersInRoom(currentRoom));
  });
});

// Helper to get users in a room
function getUsersInRoom(room) {
  const roomSockets = io.sockets.adapter.rooms.get(room) || new Set();
  return Array.from(roomSockets).map(id => users[id]).filter(Boolean);
}

// API routes
app.get('/api/messages', (req, res) => {
  const room = req.query.room || 'General';
  res.json(getRoomMessages(room));
});

app.get('/api/users', (req, res) => {
  const room = req.query.room || 'General';
  res.json(getUsersInRoom(room));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 