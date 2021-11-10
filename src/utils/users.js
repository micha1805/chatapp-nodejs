const users = []


// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
	// Clean the data
	// (.trim removes empty spaces at the beginning and end)
	username = username.trim().toLowerCase()
	room = room.trim().toLowerCase()


	// Validate data
	if(!username || !room){
		return {
			error: "username and room are required!"
		}
	}

	// Check for existing user
	const existingUser = users.find((user)=>{

		return user.room === room && user.username === username

	})


	// validate username

	if(existingUser){
		return {
			error: "Username is in use!"
		}
	}


	// Store user, when the above code didn't run, namely when it's ok
	const user = {id, username, room}
	users.push(user)
	return { user }

	// Note : we only returns an object with an error key XOR an object with a user key
	// {error: "something"} XOR {user: user Object}
}

const removeUser = (id) =>{
	const index = users.findIndex(user => user.id === id )

	if(index !== -1){
		// returns first element of filtered users array
		return users.splice(index, 1)[0]
	}

}

const getUser = id => users.find(user => user.id === id)


const getUsersInRoom = (room) =>  {
	// Clean the room name to get the same as recorded :
	room = room.trim().toLowerCase()

	return users.filter(user => user.room === room)

}

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom
}
