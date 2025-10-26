const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// delete request logger
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connection successful');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Load chat history
  Message.find().sort({ timestamp: -1 }).limit(50).exec()
    .then(messages => {
      socket.emit('history', messages.reverse());
    })
    .catch(err => {
      console.error('load history error:', err);
    });

  // handle new message
  socket.on('chat message', async (msg) => {
    console.log('receive message:', msg);
    try {
      const message = new Message({ user: msg.user, message: msg.text });
      await message.save();
      io.emit('chat message', message);
    } catch (err) {
      console.error('save message error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});