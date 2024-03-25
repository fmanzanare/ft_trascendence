export function handleChatInput()
{
	// console.log('Hola Victor')
	const roomname = json.parse(document.getelementbyid('room-name').textcontent);

	const chatsocket = new websocket(
		'ws://'
		+ window.location.host
		+ '/ws/chat/'
		+ roomname
		+ '/'
	);

	chatsocket.onmessage = function(e) {
		const data = json.parse(e.data);
		document.queryselector('#chat-log').value += (data.message + '\n');
	};

	chatsocket.onclose = function(e) {
		console.error('chat socket closed unexpectedly');
	};

	document.queryselector('#chatInput').focus();
	document.queryselector('#chatInput').onkeyup = function(e) {
		if (e.key === 'Enter') {  // enter, return
			document.queryselector('#chat-message-submit').click();
		}
	};

	document.queryselector('#chat-message-submit').onclick = function(e) {
		const messageinputdom = document.queryselector('#chatInput');
		const message = messageinputdom.value;
		chatsocket.send(json.stringify({
			'message': message
		}));
		messageinputdom.value = '';
	};
} 