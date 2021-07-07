const express = require('express')
const app = express()
const fs = require('fs')
var ss = require('socket.io-stream')
//const cors = require('cors')
//app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const { v4: uuidV4 } = require('uuid')
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId, userName) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId, userName);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message, userName)
  }); 
    
    socket.on('screen-share', stream => {
      io.to(roomId).emit('screenShare', stream, userName)
    })

    socket.on('raise-hand', () => {
      //send message to the same room
      io.to(roomId).emit('raiseHand', userName)
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId, userName)
    })
  })
})

server.listen(process.env.PORT||3030)
