import { handleChatInput } from "./chat.js";


export function displayChat()
{
	const $chatButton = document.getElementById("displayChat");
	const $chat = document.getElementById("chat");
	if($chat.classList.contains('d-none'))
	{
		$chatButton.classList.add('d-none');
		$chat.classList.remove('d-none');
		document.querySelector("#addFriend").onclick = requestFriendship;
		getFriends();
		console.log("Abre chat");
	}
	else
	{
		$chatButton.classList.remove('d-none');
		$chat.classList.add('d-none');
	}
}

// Function to handle the button click event
function handleButtonClick(event) {
	console.log("Button clicked");
	const button = event.target;
	const username = button.getAttribute("data-username");
	const action = button.id === "plusBtn" ? "accept" : "reject";

	const url = apiUrl + "friends/";
	const token = sessionStorage.getItem("pongToken");

	fetch(url, {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Authorization": token
		},
		body: JSON.stringify({
			"username": username,
			"action": action
		}),
	})
	.then((response) => {
		if (!response.ok) {
			throw new Error(`Error in request: ${response.status}`);
		}
		return response.json();
	})
	.then((data) => {
		console.log("amistad aceptada o rechazada: ", data);
		getFriends();
		// handle the response data
	})
	.catch((error) => {
		console.error("error in request:", error);
	});
}

function requestFriendship(e){
	const friendInputDom = document.querySelector('#searchFriend');
	const $token = sessionStorage.getItem('pongToken');
	const friend = friendInputDom.value;
	console.log(friend);
	const $friendsUrl = apiUrl + 'friends/';
	const $loginUrl = apiUrl + 'login/';
	fetch($friendsUrl, {
		method: 'POST',
		headers: {
			"Content-Type": 'application/json',
			"Authorization": $token
		},
		body: JSON.stringify({
			"username": friend,
			"action": "add"
		})
	})
	.then(response => {
		if (!response.ok) {
			throw new Error(`Error en la solicitud: ${response.status}`);
		}
		return response.json()
	})
}

// Retrieves the list of friends from the server and prints them.
function getFriends() {

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
		console.log("muestro friendlist")
		console.log(friendList);
		printFriends(friendList);
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}

function deleteFriendshipRequestButtons(friendList) {
	const chatPeople = document.getElementById('left-bar-chat');
	if (!chatPeople) {
		return;
	}
	const existingNames = Array.from(chatPeople.querySelectorAll('p')).map(node => node.innerText);
	existingNames.forEach(name => {
		const nodeToRemove = chatPeople.querySelector(`p[data-username="${name}"]`);
		if (nodeToRemove && !friendList.some(friend => friend.username === name && friend.status === "PENDING")) {
			console.log("Removing node: ", nodeToRemove);
			nodeToRemove.remove();
		}
		const plusBtnToRemove = chatPeople.querySelector(`button[data-username="${name}"]#plusBtn`);
		if (plusBtnToRemove && !friendList.some(friend => friend.username === name && friend.status === "PENDING")) {
			console.log("Removing plus button: ", plusBtnToRemove);
			plusBtnToRemove.remove();
		}
		const lessBtnToRemove = chatPeople.querySelector(`button[data-username="${name}"]#lessBtn`);
		if (lessBtnToRemove && !friendList.some(friend => friend.username === name && friend.status === "PENDING")) {
			console.log("Removing less button: ", lessBtnToRemove);
			lessBtnToRemove.remove();
		}
	});
}

// Prints the list of friends in the chat
function printFriends(friendList) {
	let chatPeople = document.getElementById('left-bar-chat');
	if (!chatPeople || !friendList) {
		return;
	}
	// let newFriendCont = document.createElement('div');
	let newFriendCont;
	let nameNode;
	let plusBtnNode;
	let lessBtnNode;
	
	deleteFriendshipRequestButtons(friendList);
	for (let i = 0; i < friendList.length; i++) {
		if (chatPeople.querySelector(`p[data-username="${friendList[i].username}"]`)) {
			continue;
		} else if((friendList[i].status === 'PENDING'
			&& friendList[i].friendUsername !== friendList[i].username)
			|| friendList[i].status === 'ACCEPTED' || friendList[i].status === 'REJECTED') {
			newFriendCont = document.createElement('div');
			newFriendCont.setAttribute("style", "display: flex; justify-content: space-between;");

			nameNode = document.createElement('p');
			nameNode.innerText = friendList[i].username;
			nameNode.setAttribute("id", "friendName");
			nameNode.setAttribute("data-username", friendList[i].username);
			if (friendList[i].status === 'ACCEPTED') {
				nameNode.onclick = () => handleChatInput(friendList[i], friendList[i].username);
				nameNode.style.cursor = "pointer";
			}
			newFriendCont.appendChild(nameNode);

			if (friendList[i].status === 'PENDING' || friendList[i].status === 'REJECTED') {
				plusBtnNode = document.createElement('button');
				plusBtnNode.setAttribute("id", "plusBtn");
				plusBtnNode.setAttribute("data-username", friendList[i].username);
				plusBtnNode.onclick = handleButtonClick;
				plusBtnNode.innerText = "+";
				Object.assign(plusBtnNode, { type: "button", style: "margin-left: auto;" });

				lessBtnNode = document.createElement('button');
				lessBtnNode.setAttribute("id", "lessBtn");
				lessBtnNode.setAttribute("data-username", friendList[i].username);
				lessBtnNode.setAttribute("type", "button");
				lessBtnNode.onclick = handleButtonClick;
				lessBtnNode.innerText = "-";
				newFriendCont.appendChild(nameNode);
				newFriendCont.appendChild(plusBtnNode);
				newFriendCont.appendChild(lessBtnNode);
			}
			else {
				console.log("Friend accepted");
				newFriendCont.appendChild(nameNode);
			}
			chatPeople.appendChild(newFriendCont);
		}
	}
}

export function changeViewProfile()
{
	const $infoProfile = document.getElementById('infoProfile');
	const $historyProfile = document.getElementById('historyProfile');
	const $infoTab = document.getElementById('infoTab');
	const $historyTab = document.getElementById('historyTab');
	if ($infoProfile.classList.contains('show', 'active'))
	{
		$infoProfile.classList.remove('show', 'active');
		$historyProfile.classList.add('show', 'active');
		$historyProfile.classList.remove('d-none');
		$infoTab.classList.remove('active');
		$historyTab.classList.add('active');
	}
	else
	{
		$infoProfile.classList.add('show', 'active');
		$historyProfile.classList.remove('show', 'active');
		$historyProfile.classList.add('d-none');
		$infoTab.classList.add('active');
		$historyTab.classList.remove('active');
	}
}

export function changeViewData()
{
	const $dataUserShow = document.getElementById('dataUserShow');
	const $dataUserChange = document.getElementById('dataUserChange');
	$dataUserShow.classList.add('d-none');
	$dataUserChange.classList.remove('d-none');
}