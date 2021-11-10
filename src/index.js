const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser,	getUsersInRoom } = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

// Definition d'un repertoire public, car on va utiliser des ressources
// STATIQUES qui doivent etre accessibles publiquement :
app.use(express.static(publicDirectoryPath))


io.on('connection', (socket)=>{
	console.log('New websocket connection')


// When a new user connects to the server :

	socket.on('join', (options, ackCallback)=>{

		const {error, user} = addUser({id: socket.id, ...options})

		if(error){
			// sending back a message, defined as an error
			return ackCallback(error)
		}

		// create a room object, using .join(room)
		socket.join(user.room)

		// emit a message to the new client
		socket.emit('message', generateMessage("Admin", 'Welcome !'))
		// emit a message to everyone else in that room, but the current user:
		socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined!`))
		// track room data, to use it on the client side (sidebar esp.)
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		})


		// Calling the calback witjhout argument, so no error, as we defined it
		ackCallback()
	})


	socket.on('sendMessage', (message, ackCallback)=>{

		const filter = new Filter()
		const user = getUser(socket.id)

		if(filter.isProfane(message)){
			return ackCallback('Profanity is not allowed you muthafuka!')
		}


		io.to(user.room).emit('message', generateMessage(user.username, message))
  	// The following arguments will be transmitted back to the client
  	ackCallback()

  })

	socket.on('disconnect', ()=>{

		const user = removeUser(socket.id)

		if(user){
	  	// on utilise emit et pas broadcast vu que par défintion le client
	  	// est maintenant déconnecté :
	  	io.to(user.room).emit('message', generateMessage("Admin", `${user.username} has left!`))
	  	io.to(user.room).emit('roomData', {
	  		room: user.room,
	  		users: getUsersInRoom(user.room)
	  	})

  	}

})

	socket.on('sendLocation', (coords, ackCallback)=>{

		const user = getUser(socket.id)

		io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?=${coords.latitude},${coords.longitude}`))
		ackCallback()
	})

})

server.listen(port, ()=>{
	console.log(`App running on port ${port}`)
})
