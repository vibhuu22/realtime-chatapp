// this is a server created for real-time-chat app
require('dotenv').config(); 

const express = require('express');

// updating to use the routes


// websocket.io implementation

const http = require('http');
const { Server } = require ('socket.io');
const jwt = require('jsonwebtoken');

const cors = require ('cors');
const authRoutes = require('./routes/auth');


const userRoutes = require('./routes/users');  

const messageRoutes = require('./routes/messages'); 

const pool = require('./db');

const app = express();
const server = http.createServer(app);


// Socket.Io setup with CORS

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:5500", "http://localhost:5000"],  // Allow multiple origins
    methods: ["GET", "POST"],
    credentials: true
  }
});
const PORT = process.env.PORT || 5000; ;

// Middleware to parse JSON 

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(cors({
   origin: "*", // later replace with Vercel URL
  credentials: true
}));

// Routes

app.use('/api/auth', authRoutes) ;
app.use('/api/users', userRoutes);  // NEW
app.use('/api/messages', messageRoutes); 

//Test Route

app.get('/',(req,res)=>{
    res.json({message : 'Server is running!', id:'300'});
});


// ============================================
// WebSocket Connection Handling
// ============================================

// Middleware to authenticate socket connections


io.use((socket,next)=>{
    const token = socket.handshake.auth.token ;

    if(!token){
        return next(new Error('Authentication error : No token provided'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err,decoded)=>{
        if(err){
            return next(new Error('Authentication error : Invalid token'));
        }

        // Attach info to socket
        socket.userId = decoded.userId ;
        socket.username = decoded.username;
        next();
    });
});


// Handle socket connections

io.on('connection', (socket)=>{
    console.log(`✅ User connected: ${socket.username} (ID: ${socket.userId})`);

    // Update user's online status
    pool.query(
        'UPDATE users SET is_online = TRUE, last_seen = CURRENT_TIMESTAMP WHERE id = $1',
        [socket.userId]
    );

    // Broadcast to others that this user is online

    socket.broadcast.emit('user:online',{
        userId : socket.userId,
        username : socket.username
    });

    // Handle message sending

    socket.on('message:send', async(data)=>{
        try{
            const {receiverId, content} = data;

            console.log(`📨 Message from ${socket.username} to user ${receiverId}: ${content}`);

            // store message in database

            const result = await pool.query(
                `INSERT INTO messages (sender_id, receiver_id, content)
                VALUES ($1, $2, $3)
                RETURNING *`,
                [socket.userId, receiverId, content]
            );

            const message = result.rows[0];

            // Send confirmation to sender

            socket.emit('message:sent',{
                messageId: message.id,
                tempId: data.tempId,  // Client-side temporary ID
                sentAt: message.sent_at
            });

                  // Find receiver's socket and send message
      const receiverSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.userId === receiverId);
        if (receiverSocket) {
        receiverSocket.emit('message:receive', {
          id: message.id,
          senderId: socket.userId,
          senderUsername: socket.username,
          content: message.content,
          sentAt: message.sent_at
        });
        console.log(`✅ Message delivered to ${receiverId}`);
        } else {
        console.log(`📪 User ${receiverId} is offline, message stored`);
        }

        }catch (err) {
      console.error('Error sending message:', err);
      socket.emit('message:error', { error: 'Failed to send message' });
        }
        });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
    const receiverSocket = Array.from(io.sockets.sockets.values())
    .find(s => s.userId === data.receiverId);
    
    if (receiverSocket) {
      receiverSocket.emit('typing:start', {
        userId: socket.userId,
        username: socket.username
      });
    }
  });
  
  socket.on('typing:stop', (data) => {
    const receiverSocket = Array.from(io.sockets.sockets.values())
      .find(s => s.userId === data.receiverId);
    
    if (receiverSocket) {
      receiverSocket.emit('typing:stop', {
        userId: socket.userId
      });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.username}`);
    
    // Update user's online status
    pool.query(
      'UPDATE users SET is_online = FALSE, last_seen = CURRENT_TIMESTAMP WHERE id = $1',
      [socket.userId]
    );
    
    // Broadcast to others that this user is offline
    socket.broadcast.emit('user:offline', {
      userId: socket.userId,
      username: socket.username
    });
  });
});

// Start server (use 'server' not 'app')
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready`);
});


app.get('/api/status', (req,res)=>{
    res.json({status: 'active', timestamp: Date.now()});
});

app.post('/api/echo', (req,res)=>{

    res.json({message: 'Request recived at /api/echo'});
    console.log('Request recived at /api/echo');
})



