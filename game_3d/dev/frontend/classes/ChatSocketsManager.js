import { getChatMessages, handleIncommingMessage, removeAllMessagesInChatLog } from '../helpers/chat.js';
import { openChatWebSockets } from '../index.js';
// import { deleteBlockedFriend, blockFriendButton } from '../helpers/changeView.js';
import { ChatSocket } from './ChatSocket.js';

export class ChatSocketsManager {

    #userId = sessionStorage.getItem("userId");

    constructor() {
	    const friendsUrl = apiUrl + 'friends/';
	    const token = sessionStorage.getItem('pongToken');

        fetch(friendsUrl, {
            method: 'GET',
            headers: {
                "Authorization": token
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
            this.#buildSockets(friendList)
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
    }

    #buildSockets(friendList) {
        const userId = this.#userId
        for (const friend of friendList) {
            const chatSocket = new WebSocket(
                'wss://' +
                'localhost:4000' +
                '/api/ws/chat/' +
                friend.friendshipId + 
                '/'
            );

            openChatWebSockets[friend.friendshipId] = new ChatSocket(chatSocket);

            chatSocket.onopen = (e) => { 
                getChatMessages(friend.friendshipId);
            }

            chatSocket.onmessage = (e) => {
                handleIncommingMessage(e, friend)
            }

            chatSocket.onclose = {}
        }
    }
    
    /* printFriendlistInChat(friendList) {

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
    } */

}