const socket = io()


// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {

	// New message element
	const $newMessage = $messages.lastElementChild


	//Height of the new message
	const newMessageStyles = getComputedStyle($newMessage)
	   // transform '16px' string to 16 as a number
	const newMessageMargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


	// Visible height
	const visibleHeight = $messages.offsetHeight

	// Height of messages container
	const containerHeight = $messages.scrollHeight

	// How far have I scrolled ?
	const scrollOffset = $messages.scrollTop + visibleHeight

	// Verifier si l'on veut être automatiquement redirigé vers le bas
	//  ou si l'on reste au niveau de scroll actuel. Afin d'eviter
	// un autoscroll lorsque l'on regarde les anciens messages et qu'un
	//  nouveau message vient d'arriver
	if(containerHeight - newMessageHeight <= scrollOffset ){
		$messages.scrollTop = $messages.scrollHeight
	}


}


// opening socket
socket.on('message', (msg)=>{
	console.log(msg)
	const html = Mustache.render(messageTemplate, {
		username: msg.username,
		message: msg.text,
		createdAt: moment(msg.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()
})

socket.on('locationMessage', (locationObject)=>{
	console.log(locationObject)
	const html = Mustache.render(locationMessageTemplate, {
		username: locationObject.username,
		gmapsURL: locationObject.url,
		createdAt: moment(locationObject.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend', html)

})


socket.on('roomData', ({ room, users })=>{

	const html = Mustache.render(sidebarTemplate, {
		users,
		room
	})
	document.querySelector('#sidebar').innerHTML = html

})


// Events handling :
$messageForm.addEventListener('submit', (e)=>{
	e.preventDefault()

	// Griser/désactiver le bouton le temps que l'event soit effectué :
	$messageFormButton.setAttribute('disabled', 'disabled')

	// const msg = document.querySelector('input[name=message]').value
	// Où bien :

	const message = e.target.elements.message.value

	socket.emit('sendMessage', message, (error)=> {
		// reactiver le bouton une fois que le message a été reçu :
		$messageFormButton.removeAttribute('disabled')
		$messageFormInput.value = ''
		$messageFormInput.focus()
		if(error){
			return console.log(error)
		}

		console.log('Message delivered')
	})

})


$sendLocationButton.addEventListener('click', (e)=>{

	// check if geolocation is available
	if(!navigator.geolocation){
		return alert('Geolocation is not supported by your navigator')
	}

	$sendLocationButton.setAttribute('disabled', 'disabled')

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit('sendLocation', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}, ()=>{
			$sendLocationButton.removeAttribute('disabled')
			console.log('Location shared!')
		})
	})

})



socket.emit('join', { username, room }, (error) => {
	if(error){
		alert(error)
		// redirect to root
		location.href = '/'
	}
})
