export function handleChatInput()
{
	if (sessionStorage.getItem('userId') === null) {
		console.error('User not logged in');
		return;
	}
	console.log(sessionStorage.getItem('userId'));
	// const roomName = JSON.parse(document.getElementById('room-name').textContent);
	// const userName = JSON.parse(document.getElementById('user-name').textContent);
	const $token = sessionStorage.getItem('pongToken');
	const $friendsUrl = apiUrl + 'friends/';
	fetch($friendsUrl, {
		method: 'GET',
		headers: {
			"Authorization": $token
		}
	})
	.then(response => {
		if (!response.ok) {
			throw new Error(`Error en la solicitud: ${response.status}`);
		}
		return response.json()
	})
	.then(data => {
		const friendList = data.context.friends;
		printFriends(friendList);
		console.log(friendList);
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
		

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
		console.log(friend);
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
}

function printFriends(friendList){ 
	let chatPeople = document.getElementById('left-bar-chat');

	let newFriendCont = document.createElement('div');
	newFriendCont.setAttribute("style", "display: flex; justify-content: space-between;");
	
	for (let i = 0; i < friendList.length; i++) {
		console.log(friendList[i].myFriend__username);
		console.log(friendList[i].myFriend);
		let nameNode = document.createElement('p');
		nameNode.innerText = friendList[i].myFriend__username;
		newFriendCont.appendChild(nameNode);
		let btnNode = document.createElement('button');
		btnNode.innerText = "+";
		btnNode.setAttribute("type", "button");
		let lessBtnNode = document.createElement('button');
		lessBtnNode.innerText = "-";
		lessBtnNode.setAttribute("type", "button");
		newFriendCont.appendChild(nameNode);
		newFriendCont.appendChild(btnNode);
		newFriendCont.appendChild(lessBtnNode);
		chatPeople.appendChild(newFriendCont);

	}
}