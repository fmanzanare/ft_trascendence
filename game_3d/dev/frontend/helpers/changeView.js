import { handleChatInput } from "./chat.js";
import { openChatWebSockets } from "../index.js";


export function displayChat()
{
	const $chatButton = document.getElementById("displayChat");
	const $chat = document.getElementById("chat");
	const $notification = document.getElementById("notificationMsg");
	if($chat.classList.contains('d-none'))
	{
		if (!$notification.classList.contains('d-none')){
			$notification.classList.add('d-none');
		}
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
	let action;
	if (button.classList.contains("plusBtn")) {
		action = "accept";
	} else if (button.classList.contains("lessBtn")) {
		action = "reject";
	} else if (button.classList.contains("blockBtn")) {
		action = "block";
	}

	console.log("Button action: ", action);
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
		console.log("amistad aceptada, rechazada o bloqueada: ", data);
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
	if (friend === sessionStorage.getItem('userName')) {
		alert('You cannot add yourself as a friend');
		return;
	}
	friendInputDom.value = '';
	const $friendsUrl = apiUrl + 'friends/';
	const $loginUrl = apiUrl + 'login/';

	if (friend.trim() === '') {
		alert('Please enter a friend username');
		return;
	}
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
export function getFriends() {

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
		deleteBlockedFriend(friendList);
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
		if (nodeToRemove && !friendList.some(friend => friend.username === name
			&& (friend.status === "PENDING"))) {
			console.log("Removing node: ", nodeToRemove);
			nodeToRemove.remove();
		}
		const plusBtnToRemove = chatPeople.querySelector(`button.plusBtn[data-username="${name}"]`);
		if (plusBtnToRemove && !friendList.some(friend => friend.username === name
			&& friend.status === "PENDING")) {
			console.log("Removing plus button: ", plusBtnToRemove);
			plusBtnToRemove.remove();
		}
		const lessBtnToRemove = chatPeople.querySelector(`button.lessBtn[data-username="${name}"]`);
		if (lessBtnToRemove && !friendList.some(friend => friend.username === name
			&& friend.status === "PENDING")) {
			console.log("Removing less button: ", lessBtnToRemove);
			lessBtnToRemove.remove();
		}
	});
}

// Function that adds a button to block a friend who has a status of 'ACCEPTED'
function blockFriendButton(friendList) {
	const chatPeople = document.getElementById('left-bar-chat');
	if (!chatPeople) {
		return;
	}
	const existingNames = Array.from(chatPeople.querySelectorAll('p')).map(node => node.innerText);
	existingNames.forEach(name => {
		const friendDiv = chatPeople.querySelector(`div[data-username="${name}"]`);
		if (friendDiv && friendList.some(friend => friend.username === name
			&& friend.status === "ACCEPTED" )) {
			const existingBlockBtn = friendDiv.querySelector('.blockBtn');
            if (!existingBlockBtn) {
				const blockBtn = document.createElement('button');
				blockBtn.setAttribute("class", "blockBtn btn btn-sm");
				blockBtn.setAttribute("data-username", name);
				blockBtn.onclick = handleButtonClick;
				blockBtn.innerHTML = 	`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-ban' viewBox='0 0 16 16'>
										<path d='M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0'/>
									</svg>`;
				friendDiv.appendChild(blockBtn);
				console.log("Adding block button: ", blockBtn);
			}
		}
	});
}

// Deletes the blocked friend name and block button from the chat
function deleteBlockedFriend(friendList) {
	const chatPeople = document.getElementById('left-bar-chat');
	if (!chatPeople) {
		return;
	}
	const existingNames = Array.from(chatPeople.querySelectorAll('p')).map(node => node.getAttribute("data-username"));
	console.log("Existing names: ", existingNames);
	existingNames.forEach(name => {
		console.log(`name: ${name} friendList: ${friendList}`);
		const friendName = chatPeople.querySelector(`p[data-username="${name}"]`);
		console.log(`friend.username: ${friendList[0].username} friend status: ${friendList[0].status}`);
		if (friendName && friendList.some(friend => friend.username === name
			&& friend.status === "BLOCKED")) {
			console.log("Removing blocked friend: ", friendName);
			friendName.remove();
		}
		const blockBtn = chatPeople.querySelector(`button[data-username="${name}"]#blockBtn`);
		if (blockBtn && friendList.some(friend => friend.username === name
			&& friend.status === "BLOCKED")) {
			console.log("Removing block button: ", blockBtn);
			blockBtn.remove();
		}
	});
}
function printFriends(friendList) {
	let chatPeople = document.getElementById('friend-list-container');
	if (!chatPeople || !friendList) {
		return;
	}
	console.log("Friend list: ", friendList);
	deleteFriendshipRequestButtons(friendList);
	chatPeople.innerHTML = '';

	for (let i = 0; i < friendList.length; i++) {
		if (chatPeople.querySelector(`p[data-username="${friendList[i].username}"]`)) {
			continue;
		}

		if((friendList[i].status === 'PENDING' && friendList[i].friendUsername !== friendList[i].username)
			|| friendList[i].status === 'ACCEPTED') {

			let newFriendCont = document.createElement('div');
			newFriendCont.classList.add('d-flex', 'w-100', 'justify-content-between', 'align-items-center', 'mb-2');
			newFriendCont.setAttribute("data-username", friendList[i].username);

			let nameNode = document.createElement('p');
			nameNode.innerText = friendList[i].username;
			nameNode.setAttribute("data-username", friendList[i].username);
			nameNode.classList.add('m-0');

			if (friendList[i].status === 'ACCEPTED') {
				// handleChatInput(friendList[i], friendList[i].username)
				nameNode.onclick = () => handleChatInput(friendList[i], friendList[i].username);
				nameNode.style.cursor = "pointer";
			}

			newFriendCont.appendChild(nameNode);

			if (friendList[i].status === 'PENDING') {
				console.log("Colocando botones");

				let plusBtnNode = document.createElement('button');
				plusBtnNode.classList.add("plusBtn", "btn", "btn-sm", "btn-success");
				plusBtnNode.setAttribute("data-username", friendList[i].username);
				plusBtnNode.onclick = handleButtonClick;
				plusBtnNode.innerText = "+";
				Object.assign(plusBtnNode, { 
					type: "button", 
					style: "margin-left: 5rem;--bs-btn-bg: rgb(86, 186, 111);--bs-btn-border-color: rgb(86, 186, 111)" 
				});

				let lessBtnNode = document.createElement('button');
				lessBtnNode.classList.add("lessBtn", "btn", "btn-sm", "btn-danger");
				lessBtnNode.setAttribute("data-username", friendList[i].username);
				lessBtnNode.setAttribute("type", "button");
				lessBtnNode.onclick = handleButtonClick;
				lessBtnNode.innerText = "-";

				newFriendCont.appendChild(plusBtnNode);
				newFriendCont.appendChild(lessBtnNode);
			} else {
				console.log("Friend accepted");
			}

			chatPeople.appendChild(newFriendCont);
		}
	}

	blockFriendButton(friendList);
	deleteBlockedFriend(friendList);
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