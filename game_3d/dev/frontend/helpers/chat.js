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

	window.openChatWebSockets[friendship.friendshipId]?.chatMessages?.forEach(element => {
		document.querySelector('#chat-log').value += (element.message);
		console.log(element.message)
	});
	// Create new WebSocket and set its name
	if (!window.openChatWebSockets[friendship.friendshipId]?.chatSocket) {
		console.log(sessionStorage.getItem('userName'), 'Creating new WebSocket: ', friendship.friendshipId);
		const chatSocket = new WebSocket(
			'ws://' + 'localhost:8000' + '/ws/chat/' + friendship.friendshipId + '/'
		);

		// Saving messages in global variable
		window.openChatWebSockets[friendship.friendshipId] = {};
		window.openChatWebSockets[friendship.friendshipId].chatSocket = chatSocket;
		window.openChatWebSockets[friendship.friendshipId].chatMessages = [];

		// Assign event handlers here to ensure they are applied to the new WebSocket
		chatSocket.onmessage = function (e) {
			const data = JSON.parse(e.data);
			document.querySelector('#chat-log').value += (data.message);
			window.openChatWebSockets[friendship.friendshipId].chatMessages.push({
				senderId: sessionStorage.getItem('userId'),
				isRead: false,
				message: data.message
				});
		}

		chatSocket.onclose = function (e) {
			console.error('chat socket closed unexpectedly');
		};
	}

	console.log(window.openChatWebSockets[friendship.friendshipId]);
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
			const chatSocket = window.openChatWebSockets[friendship.friendshipId].chatSocket;
			if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
				chatSocket.send(JSON.stringify({
					message: message,
					chatId: friendship.friendshipId,
					senderId: userId,
				}));
				messageInputDom.value = ''; // Clean input before send
			}
			window.openChatWebSockets[friendship.friendshipId].chatMessages.push({
				senderId: userId,
				isRead: false,
				message: message
				});
		}
	};
}
