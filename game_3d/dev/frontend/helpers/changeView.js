import { handleChatInput } from "./chat";


export function displayChat()
{
	const $chatButton = document.getElementById("displayChat");
	const $chat = document.getElementById("chat");
	if($chat.classList.contains('d-none'))
	{
		$chatButton.classList.add('d-none');
		$chat.classList.remove('d-none');
		console.log("Abre chat");
		getFriends();
		handleChatInput();	
	}
	else
	{
		$chatButton.classList.remove('d-none');
		$chat.classList.add('d-none');
	}
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
		printFriends(friendList);
		console.log(friendList);
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}

// Prints the list of friends in the chat
function printFriends(friendList) {
	let chatPeople = document.getElementById('left-bar-chat');
	if (!chatPeople) {
		return;
	}
	// let newFriendCont = document.createElement('div');
	let newFriendCont;
	let nameNode;
	let plusBtnNode;
	let lessBtnNode;
	
	const existingNames = Array.from(chatPeople.querySelectorAll('p')).map(node => node.innerText);
	for (let i = 0; i < friendList.length; i++) {
		// Remove nodes that are not in the friendList
		if (existingNames.length > 0
			&& !friendList.some(friend => friend.myUser === existingNames[i])) {
			existingNames.forEach(name => {
				if (!friendList.some(friend => friend.myUser === name)) {
					const nodeToRemove = chatPeople.querySelector(`p[data-username="${name}"]`);
					if (nodeToRemove) {
						nodeToRemove.remove();
					}
				}
			});
		} else if (chatPeople.querySelector(`p[data-username="${friendList[i].myUser}"]`)) {
			continue;
		} else {
			newFriendCont = document.createElement('div');
			newFriendCont.setAttribute("style", "display: flex; justify-content: space-between;");

			console.log(friendList[i].myUser__username);
			console.log(friendList[i].myUser);

			nameNode = document.createElement('p');
			nameNode.innerText = friendList[i].myUser__username;
			newFriendCont.appendChild(nameNode);

			plusBtnNode = document.createElement('button');
			plusBtnNode.setAttribute("id", "plusBtn");
			plusBtnNode.setAttribute("data-username", friendList[i].myUser__username);
			plusBtnNode.innerText = "+";
			Object.assign(plusBtnNode, { type: "button", style: "margin-left: auto;" });

			lessBtnNode = document.createElement('button');
			lessBtnNode.setAttribute("id", "lessBtn");
			lessBtnNode.setAttribute("data-username", friendList[i].myUser__username);
			lessBtnNode.setAttribute("type", "button");
			lessBtnNode.innerText = "-";

			newFriendCont.appendChild(nameNode);
			newFriendCont.appendChild(plusBtnNode);
			newFriendCont.appendChild(lessBtnNode);
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