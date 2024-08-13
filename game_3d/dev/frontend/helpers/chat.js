import { openChatWebSockets } from "../index.js";

/**
 * Shows the current chat friend's name in the upper chat bar and clears the chat log.
 * @function showCurrentChatFriendName
 */
function showCurrentChatFriendName(friendName) {
	let chatLog = document.getElementById('chat-log');
	chatLog.value = '';
	let upperChatBar = document.getElementById('upper-bar');
	if (upperChatBar.querySelector('p[data-username]')) {
		upperChatBar.querySelector('p[data-username]').remove();
	}
	let friendBox = document.createElement('div');
	friendBox.setAttribute("style", "display: flex; justify-content: space-between;");
	upperChatBar.appendChild(friendBox);
	let currentChatFriend = document.createElement('p');
	currentChatFriend.innerText = friendName;
	currentChatFriend.setAttribute("id", "friendNameUpperBar");
	currentChatFriend.setAttribute("style", "cursor:pointer;");
	currentChatFriend.setAttribute("data-username", friendName);
	friendBox.appendChild(currentChatFriend);
	currentChatFriend.addEventListener("click", () => goToUserProfileChat(friendName));		
}

function goToUserProfileChat(friendName){
	console.log("holaaaaaaaaaaaaaaaaaaaaaaaa ", friendName);
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

	showCurrentChatFriendName(friendName);

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
		
		// Assign event handlers here to ensure they are applied to the new WebSocket
		openChatWebSockets[friendship.friendshipId].chatSocket.onmessage = function (e) {
			const data = JSON.parse(e.data);
			if (data.senderUsername === document.querySelector('#friendNameUpperBar').getAttribute('data-username')) {
				document.querySelector('#chat-log').value += data.message;
			}
			openChatWebSockets[friendship.friendshipId].chatMessages.push({
				senderId: sessionStorage.getItem('userId'),
				isRead: false,
				message: data.message
				});
		};

		openChatWebSockets[friendship.friendshipId].chatSocket.onclose = function (e) {
			console.error('chat socket closed unexpectedly');
		};

		openChatWebSockets[friendship.friendshipId].chatSocket.onopen = function (e) {
			getChatMessages(friendship.friendshipId);
		};
		console.log(openChatWebSockets[friendship.friendshipId]);
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
				if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
					chatSocket.send(JSON.stringify({
						message: message,
						chatId: friendship.friendshipId,
						senderId: userId,
					}));
					messageInputDom.value = ''; // Clean input before send
				}
				document.querySelector('#chat-log').value += message;
			}
		};
		console.log("mostrando contenido de openChatWebSockets:", openChatWebSockets);
	}
}
