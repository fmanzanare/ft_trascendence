import { openChatWebSockets } from "../index.js";
import { acceptGameInvitation } from "./gameMode.js";

/**
 * Shows the current chat friend's name in the upper chat bar and clears the chat log.
 * @function showCurrentChatFriendName
 */
function showCurrentChatFriendName(friendName, friendshipId) {
	// Remove the previous chat log
	let chatLog = document.getElementById('chat-log');
	chatLog.value = '';
	// Remove the previous friend name from the upperChatBar
	let upperChatBar = document.getElementById('upper-bar');
	if (upperChatBar.querySelector('p[data-username]')) {
		upperChatBar.querySelector('p[data-username]').remove();

	}
	let currentChatFriend = document.createElement('p');
	currentChatFriend.innerText = friendName;
	currentChatFriend.setAttribute("id", "friendNameUpperBar");
	currentChatFriend.setAttribute("style", "display: flex; justify-content: center; align-items: center; margin: 0;");
	currentChatFriend.setAttribute("data-username", friendName);

	// Create a button element
	const playButton = document.createElement('button');
	playButton.innerText = 'Play';

	// Set the button's style
	playButton.setAttribute("class", "start-0 position-absolute");
	playButton.setAttribute("style", "margin-left: 5px;");
	playButton.setAttribute("data-friendship-id", friendshipId);
	console.log("friendshipId:", friendshipId);
	playButton.onclick = gameInvitation;

	// Append the button to the upperChatBar
	upperChatBar.appendChild(playButton);
	upperChatBar.appendChild(currentChatFriend);
}

function gameInvitation() {
	const friendshipId = this.getAttribute("data-friendship-id");
	console.log("friendshipId game invitation:", friendshipId);
	const chatSocket = openChatWebSockets[friendshipId].chatSocket;

	
	if (openChatWebSockets[friendshipId].gameInvitationReceived) {
		console.log("Game invitation accepted");
		if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
			chatSocket.send(JSON.stringify({
				message: "",
				chatId: friendshipId,
				senderId: sessionStorage.getItem('userId'),
				gameInvitation: false,
				gameInvitationResponse: true
		}))};

		openChatWebSockets[friendshipId].gameInvitationReceived = false;
		const hostGameId = openChatWebSockets[friendshipId].hostGameId;
		const guestGameId = openChatWebSockets[friendshipId].guestGameId;

		console.log("hostGameId:", hostGameId, "guestGameId:", guestGameId);
		// Remove the 'Reject' button from the upperChatBar
		const rejectButton = document.querySelector('#upper-bar button.rejectButton[data-friendship-id]');
		if (rejectButton) {
			rejectButton.remove();
		}
		acceptGameInvitation(hostGameId, guestGameId);
		openChatWebSockets[friendshipId].gameInvitationReceived = false;
		openChatWebSockets[friendshipId].gameInvitationResponse = false;
		openChatWebSockets[friendshipId].hostGameId = null;
		openChatWebSockets[friendshipId].guestGameId = null;
		return;
	} else {
		const userId = sessionStorage.getItem('userId');
		const messageInputDom = document.querySelector('#chatInput');
		const chatSocket = openChatWebSockets[friendshipId].chatSocket;
		if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
			chatSocket.send(JSON.stringify({
				message: "",
				chatId: friendshipId,
				senderId: userId,
				gameInvitation: true,
				gameInvitationResponse: false,
				hostGameId: userId,
			}));
			openChatWebSockets[friendshipId].hostGameId = userId;
			messageInputDom.value = ''; // Clean input before send
			document.querySelector('#chat-log').value += "Game invitation sent\n";
		}
		console.log("gameInvitationSent");
	}
}

function rejectGameInvitation() {
	const friendshipId = this.getAttribute("data-friendship-id");
	const chatSocket = openChatWebSockets[friendshipId].chatSocket;
	if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
		chatSocket.send(JSON.stringify({
			message: "Game invitation rejected",
			chatId: friendshipId,
			senderId: sessionStorage.getItem('userId'),
			gameInvitationResponse: false
		}));
	}
}
// Retrieves the list of friends from the server and prints them.
function getChatMessages(friendshipId) {

	const $token = sessionStorage.getItem('pongToken');
	const $chatMessagesUrl = `${apiUrl}chatMessages/${friendshipId}/`;

	fetch($chatMessagesUrl, {
		method: 'GET',
		headers: {
			"Authorization": $token,
		}
	})
	.then(response => {
		if (!response.ok) {
			throw new Error(`Error en la solicitud: ${response.status}`);
		}
		return response.json()
	})
	.then(data => {
		// Asignar los mensajes recibidos al array global
		if (Array.isArray(data.messages)) {
			openChatWebSockets[friendshipId].chatMessages = data.messages;
		} else {
			console.error('Error: data.messages no es un array');
		}
		console.log("data.messages:", data.messages);

		// Actualizar el chat-log con los mensajes recibidos
		const chatLog = document.querySelector('#chat-log');
		chatLog.innerHTML = ''; // Limpiar el chat-log antes de agregar los nuevos mensajes
		openChatWebSockets[friendshipId].chatMessages.forEach(message => {
			chatLog.value += message.message;
			// const newMessageElement = document.createElement('div');
			// newMessageElement.textContent = message;
			// chatLog.appendChild(newMessageElement);
		});
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}

/**
 * Handles the chat input functionality.
 * It shows the current chat friend's name in the upper chat bar and clears the chat log.
 * It creates a new WebSocket connection if it doesn't exist or if the existing connection is not open.
 * It sends the chat message when the Enter key is pressed.
 * @param {Object} friendship - The friendship object.
 * @param {string} friendName - The name of the chat friend.
 */
export function handleChatInput(friendship, friendName) {

	showCurrentChatFriendName(friendName, friendship.friendshipId);

	console.log("muestro openChatWebSockets", openChatWebSockets);
	openChatWebSockets[friendship.friendshipId]?.chatMessages?.forEach(element => {
		document.querySelector('#chat-log').value += (element.message);
	});
	// Create new WebSocket and set its name
	if (!openChatWebSockets[friendship.friendshipId]?.chatSocket) {
		console.log(sessionStorage.getItem('userName'), 'Creating new WebSocket: ', friendship.friendshipId);
		const chatSocket = new WebSocket(
			'wss://' + 'localhost:4000' + '/api/ws/chat/' + friendship.friendshipId + '/'
		);

		// Saving messages in global variable
		openChatWebSockets[friendship.friendshipId] = {};
		openChatWebSockets[friendship.friendshipId].chatSocket = chatSocket;
		openChatWebSockets[friendship.friendshipId].chatMessages = [];
		openChatWebSockets[friendship.friendshipId].gameInvitationReceived = false;
		openChatWebSockets[friendship.friendshipId].gameInvitationResponse = false;
		openChatWebSockets[friendship.friendshipId].hostGameId = null;
		openChatWebSockets[friendship.friendshipId].guestGameId = null;
		openChatWebSockets[friendship.friendshipId].chatNotification = false;
		
		// Assign event handlers here to ensure they are applied to the new WebSocket
		openChatWebSockets[friendship.friendshipId].chatSocket.onmessage = function (e) {
			const data = JSON.parse(e.data);
			console.log('Received message:', data);
			if (data.senderUsername === document.querySelector('#friendNameUpperBar').getAttribute('data-username')
				&& data.message.trim() !== '') {
				document.querySelector('#chat-log').value += data.message;
			}
			if (data.message.trim() !== '' && data.gameInvitation === false) {
				openChatWebSockets[friendship.friendshipId].chatMessages.push({
					senderId: sessionStorage.getItem('userId'),
					isRead: false,
					message: data.message,
					chatId: friendship.friendshipId,
				});
			} // the user receives a game invitation
			else if (data.gameInvitation === true && data.senderUsername !== sessionStorage.getItem('userName')) {
				openChatWebSockets[friendship.friendshipId].gameInvitationReceived = true;
				openChatWebSockets[friendship.friendshipId].hostGameId = data.senderId;
				openChatWebSockets[friendship.friendshipId].guestGameId = sessionStorage.getItem('userId');

				document.querySelector('#chat-log').value += 'Game invitation received. Click on "Play" button, or "Reject" button\n';
				let upperChatBar = document.getElementById('upper-bar');
				// Create a button element for rejecting the game invitation
				const rejectButton = document.createElement('button');
				rejectButton.innerText = 'Reject';

				// Set the button's style
				rejectButton.setAttribute("class", "rejectButton start-0 position-absolute");
				rejectButton.setAttribute("style", "margin-left: 55px;");
				rejectButton.setAttribute("data-friendship-id", friendship.friendshipId);
				rejectButton.onclick = rejectGameInvitation;

				// Append the button to the upperChatBar
				upperChatBar.appendChild(rejectButton);
			} else if (data.gameInvitationResponse === true && data.senderUsername !== sessionStorage.getItem('userName')) {
				openChatWebSockets[friendship.friendshipId].gameInvitationReceived = false;
				openChatWebSockets[friendship.friendshipId].gameInvitationResponse = false;
				openChatWebSockets[friendship.friendshipId].hostGameId = null;
				openChatWebSockets[friendship.friendshipId].guestGameId = null;
				
				console.log("hostGameId:", sessionStorage.getItem('userId'), "guestGameId:", data.senderId);
				document.querySelector('#chat-log').value += 'Game invitation accepted. Starting Game\n';
				acceptGameInvitation(sessionStorage.getItem('userId'), data.senderId);
			} else if (data.gameInvitationResponse === false && data.senderUsername !== sessionStorage.getItem('userName')) {
				openChatWebSockets[friendship.friendshipId].gameInvitationReceived = false;
				openChatWebSockets[friendship.friendshipId].gameInvitationResponse = false;
				openChatWebSockets[friendship.friendshipId].hostGameId = null;
				openChatWebSockets[friendship.friendshipId].guestGameId = null;
				document.querySelector('#chat-log').value += 'Game invitation rejected\n';
			}
		};

		openChatWebSockets[friendship.friendshipId].chatSocket.onclose = function (e) {
			console.error('chat socket closed unexpectedly');
		};

		openChatWebSockets[friendship.friendshipId].chatSocket.onopen = function (e) {
			getChatMessages(friendship.friendshipId);
		};
		// Focus on the chatInput
		document.querySelector('#chatInput').focus();
		document.querySelector('#chatInput').onkeyup = function (e) {
			if (document.querySelector('#chatInput').value.length > 0 && e.key === 'Enter') {
				const userName = sessionStorage.getItem('userName');
				const userId = sessionStorage.getItem('userId');
				console.log(userName);
				const messageInputDom = document.querySelector('#chatInput');
				console.log("messageInput length:", messageInputDom.value.length);
				const message = userName + ': ' + messageInputDom.value + '\n';
	
				console.log(friendship.friendUserId)
				// Recuperar el WebSocket correcto del mapa antes de enviar el mensaje
				const chatSocket = openChatWebSockets[friendship.friendshipId].chatSocket;
				if (message.trim() !== '' && chatSocket && chatSocket.readyState === WebSocket.OPEN) {
					chatSocket.send(JSON.stringify({
						message: message,
						chatId: friendship.friendshipId,
						senderId: userId,
						gameInvitation: false
					}));
					messageInputDom.value = ''; // Clean input before send
				}
				document.querySelector('#chat-log').value += message;
			}
		};
		console.log("mostrando contenido de openChatWebSockets:", openChatWebSockets);
	}
}
