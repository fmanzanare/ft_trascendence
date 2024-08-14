import { openChatWebSockets } from "../index.js";
import { acceptGameInvitation } from "./gameMode.js";

/**
 * Shows the current chat friend's name in the upper chat bar and clears the chat log.
 * @function showCurrentChatFriendName
 */
function showCurrentChatFriendName(friendName, friendshipId) {
	removeAllMessagesInChatLog();
	let upperChatBar = document.getElementById('upper-bar');
	if (upperChatBar.querySelector('p[data-username]')) {
		upperChatBar.querySelector('p[data-username]').remove();

	}
	let currentChatFriend = document.createElement('p');
	currentChatFriend.innerText = friendName;
	currentChatFriend.setAttribute("id", "friendNameUpperBar");
	currentChatFriend.setAttribute("style", "display: flex; justify-content: center; align-items: center; margin: 0; cursor:pointer;");
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
	currentChatFriend.addEventListener("click", () => goToUserProfileChat(friendName));		
}

function goToUserProfileChat(friendName){
	const $token = sessionStorage.getItem('pongToken');
    const $getIdUser = `${apiUrl}get_user_id/?userName=${encodeURIComponent(friendName)}`;

	fetch($getIdUser, {
        method: "GET",
        headers: {
            "Authorization": $token,
            "Content-Type": 'application/json'
        }
    })
    .then(response => {
        console.log("Response Status:", response.status);
        if (!response.ok) {
            return response.json().then(err => {
                console.error('Error response from server:', err);
                throw new Error(`Server error: ${err.error || 'Unknown error'}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data) {
            const userId = data.userId;
			goToUserProfile(userId);
        } else {
            console.error('API error:', data.error);
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        console.error('Error details:', error.message);
    });
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
		addMessageToChatLog("Game invitation accepted. Starting Game\n");
		acceptGameInvitation(hostGameId, guestGameId);
		openChatWebSockets[friendshipId].gameInvitationReceived = false;
		openChatWebSockets[friendshipId].gameInvitationResponse = false;
		openChatWebSockets[friendshipId].hostGameId = null;
		openChatWebSockets[friendshipId].guestGameId = null;
		return;
	} else {
		const userId = sessionStorage.getItem('userId');
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
			addMessageToChatLog("Game invitation sent\n");
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
		removeAllMessagesInChatLog();	
		openChatWebSockets[friendshipId].chatMessages.forEach(message => {
			addMessageToChatLog(message.message);
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
		addMessageToChatLog(element.message);
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
		
		// Receive messages from the server
		openChatWebSockets[friendship.friendshipId].chatSocket.onmessage = function (e) {
			const data = JSON.parse(e.data);
			console.log('Received message:', data);
			if (data.senderUsername === document.querySelector('#friendNameUpperBar').getAttribute('data-username')
				&& data.message.trim() !== '') {
				console.log(data.senderUsername, document.querySelector('#friendNameUpperBar').getAttribute('data-username'));
				console.log('chatNotification: true');
				openChatWebSockets[friendship.friendshipId].chatNotification = true;
				addMessageToChatLog(data.message);
			} else {
				console.log(data.senderUsername, document.querySelector('#friendNameUpperBar').getAttribute('data-username'));
				console.log('chatNotification: false');
				openChatWebSockets[friendship.friendshipId].chatNotification = false;
			}
			if (data.message.trim() !== '' && data.gameInvitation === false) {
				openChatWebSockets[friendship.friendshipId].chatMessages.push({
					senderId: sessionStorage.getItem('userId'),
					isRead: false,
					message: data.message,
					chatId: friendship.friendshipId,
				});
			} // the user receives a game invitation
			else if (data.gameInvitation === true 
				&& data.senderUsername !== sessionStorage.getItem('userName')
				&& data.senderUsername === document.querySelector('#friendNameUpperBar').getAttribute('data-username')) {
				openChatWebSockets[friendship.friendshipId].gameInvitationReceived = true;
				openChatWebSockets[friendship.friendshipId].hostGameId = data.senderId;
				openChatWebSockets[friendship.friendshipId].guestGameId = sessionStorage.getItem('userId');

				addMessageToChatLog('Game invitation received. Click on "Play" button, or "Reject" button\n');
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
			} else if (data.gameInvitationResponse === true
				&& data.senderUsername !== sessionStorage.getItem('userName')
				&& data.senderUsername === document.querySelector('#friendNameUpperBar').getAttribute('data-username')) {
				openChatWebSockets[friendship.friendshipId].gameInvitationReceived = false;
				openChatWebSockets[friendship.friendshipId].gameInvitationResponse = false;
				openChatWebSockets[friendship.friendshipId].hostGameId = null;
				openChatWebSockets[friendship.friendshipId].guestGameId = null;
				
				console.log("hostGameId:", sessionStorage.getItem('userId'), "guestGameId:", data.senderId);
				addMessageToChatLog('Game invitation accepted. Starting Game\n');
				acceptGameInvitation(sessionStorage.getItem('userId'), data.senderId);
			} else if (data.gameInvitationResponse === false
				&& data.senderUsername !== sessionStorage.getItem('userName')
				&& data.senderUsername === document.querySelector('#friendNameUpperBar').getAttribute('data-username')) {
				openChatWebSockets[friendship.friendshipId].gameInvitationReceived = false;
				openChatWebSockets[friendship.friendshipId].gameInvitationResponse = false;
				openChatWebSockets[friendship.friendshipId].hostGameId = null;
				openChatWebSockets[friendship.friendshipId].guestGameId = null;

				addMessageToChatLog('Game invitation rejected\n');
			}
		};

		// Handle unexpected closing of the WebSocket
		openChatWebSockets[friendship.friendshipId].chatSocket.onclose = function (e) {
			console.error('chat socket closed unexpectedly');
		};

		// Handle the opening of the WebSocket
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
						gameInvitation: false,
						gameInvitationResponse: false
					}));
					messageInputDom.value = ''; // Clean input before send
				}
				addMessageToChatLog(message);
			}
		};
		console.log("mostrando contenido de openChatWebSockets:", openChatWebSockets);
	}
}

function removeAllMessagesInChatLog() {
	const chatLog = document.querySelector('#chat-log');
	const paragraphs = chatLog.querySelectorAll('p');
	paragraphs.forEach(paragraph => {
		chatLog.removeChild(paragraph);
	});
}

function addMessageToChatLog(message) {
	const chatLog = document.querySelector('#chat-log');
	const paragraph = document.createElement('p');
	paragraph.setAttribute("style", "margin: 0;");
	paragraph.textContent = message;
	chatLog.appendChild(paragraph);
}

function nonHtml(){
    return    this.replace(/[&<>"'`]/g, function (char){
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;',
            '`': '&#96;'
        }
    });
}