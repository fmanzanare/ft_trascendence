export function handleChatInput(friendshipId) {
	if (sessionStorage.getItem('userId') === null) {
		console.error('User not logged in');
		return;
	}
	console.log(sessionStorage.getItem('userId'));

	console.log(friendshipId);
	// Create new WebSocket and set its name
	const chatSocket = new WebSocket(
		'ws://'
		+ 'localhost:8000'
		+ '/ws/chat/'
		+ friendshipId
		+ '/'
	);


	// When the WebSocket is opened, it prints a message in the console	
	// Receive the message and write it in the chat log
	chatSocket.onmessage = function (e) {
		const data = JSON.parse(e.data);
		document.querySelector('#chat-log').value += (data.message + '\n');
	};

	// When the WebSocket is closed, it prints a message in the console
	chatSocket.onclose = function (e) {
		console.error('chat socket closed unexpectedly');
	};

	// It focus on the chatInput and 
	document.querySelector('#chatInput').focus();
	document.querySelector('#chatInput').onkeyup = function (e) {
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
}
