export function handleChatInput()
{
	console.log('Hola Victor')
	// const roomName = JSON.parse(document.getElementById('room-name').textContent);
	// const userName = JSON.parse(document.getElementById('user-name').textContent);

	
	if (sessionStorage.getItem('userId') === null) {
		console.error('User not logged in');
		return;
	}
	// Create new WebSocket and set its name
	const chatSocket = new WebSocket(
		'ws://'
		+ 'localhost:8000'
		+ '/ws/chat/'
		+ sessionStorage.getItem('userId')
		+ '/'
	);

	document.querySelector('#addFriend').onclick = function(e) {
		const friendInputDom = document.querySelector('#searchFriend');
		const $token = sessionStorage.getItem('pongToken');
		const friend = friendInputDom.value;
		const $friendsUrl = apiUrl + 'friends/';
		const $loginUrl = apiUrl + 'login/';
		fetch($friendsUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					"Authorization": $token					
				},
				body: JSON.stringify({
					"username": friend,
					"action" : "add"
				})
			})
	};

	// When the WebSocket is opened, it prints a message in the console	
	// Receive the message and write it in the chat log
	chatSocket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		document.querySelector('#chat-log').value += (data.message + '\n');
	};

	// When the WebSocket is closed, it prints a message in the console
	chatSocket.onclose = function(e) {
		console.error('chat socket closed unexpectedly');
	};

	// It focus on the chatInput and 
	document.querySelector('#chatInput').focus();
	document.querySelector('#chatInput').onkeyup = function(e) {
		if (e.key === 'Enter') {  // enter, return
			// document.queryselector('#chat-message-submit').click();
			let userName = sessionStorage.getItem('userName');
			console.log(userName);
			const messageinputdom = document.querySelector('#chatInput');
			const message = userName + ': ' + messageinputdom.value;
			chatSocket.send(JSON.stringify({
				'message': message,
				'userName': userName
			}));
			messageinputdom.value = '';
		}
	};

	// document.querySelector('#chat-message-submit').onclick = function(e) {
	// };
} 