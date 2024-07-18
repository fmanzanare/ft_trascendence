/**
 * Shows the current chat friend's name in the upper chat bar and clears the chat log.
 * @function showCurrentChatFriendName
 */
function showCurrentChatFriendName(friendName) {
	// Remove the previous chat log
	let chatLog = document.getElementById('chat-log');
	chatLog.value = '';
	// Remove the previous friend name from the upperChatBar
	let upperChatBar = document.getElementById('upper-bar');
	if (upperChatBar.querySelector('p[data-username]')) {
		upperChatBar.querySelector('p[data-username]').remove();
	}
	let friendBox = document.createElement('div');
	friendBox.setAttribute("style", "display: flex; justify-content: space-between;");
	upperChatBar.appendChild(friendBox);

	let currentChatFriend = document.createElement('p');
	currentChatFriend.innerText = friendName;
	currentChatFriend.setAttribute("id", "friendName");
	currentChatFriend.setAttribute("data-username", friendName);
	friendBox.appendChild(currentChatFriend);
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

	// Create new WebSocket and set its name
	if (!window.openChatWebSockets.has(friendship.friendshipId)
		|| window.openChatWebSockets.get(friendship.friendshipId).readyState !== WebSocket.OPEN) {
		console.log(sessionStorage.getItem('userName'), 'Creating new WebSocket: ', friendship.friendshipId);
		const chatSocket = new WebSocket(
			'ws://' + 'localhost:8000' + '/ws/chat/' + friendship.friendshipId + '/'
		);

		// Asignar event handlers aquí para asegurarse de que se aplican al nuevo WebSocket
		chatSocket.onmessage = function (e) {
			const data = JSON.parse(e.data);
			document.querySelector('#chat-log').value += (data.message + '\n');
		}

		chatSocket.onclose = function (e) {
			console.error('chat socket closed unexpectedly');
		};

		window.openChatWebSockets.set(friendship.friendshipId, chatSocket);
	}

	// Enfocar en el chatInput
	document.querySelector('#chatInput').focus();
	document.querySelector('#chatInput').onkeyup = function (e) {
		if (e.key === 'Enter') {
			let userName = sessionStorage.getItem('userName');
			console.log(userName);
			const messageInputDom = document.querySelector('#chatInput');
			const message = userName + ': ' + messageInputDom.value;

			console.log(friendship.friendUserId)
			// Recuperar el WebSocket correcto del mapa antes de enviar el mensaje
			const chatSocket = window.openChatWebSockets.get(friendship.friendshipId);
			if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
				chatSocket.send(JSON.stringify({
					message: message,
					chatId: friendship.friendshipId,
					senderId: friendship.friendUserId,
				}));
				messageInputDom.value = ''; // Clean input before send
			}
		}
	};
}
