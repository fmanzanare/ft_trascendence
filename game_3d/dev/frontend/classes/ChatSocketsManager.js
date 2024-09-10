import { printFriends, printPendingFriends } from '../helpers/changeView.js';
import { getChatMessages, handleIncommingMessage, removeAllMessagesInChatLog } from '../helpers/chat.js';
import { friendshipSocket, openChatWebSockets } from '../index.js';
// import { deleteBlockedFriend, blockFriendButton } from '../helpers/changeView.js';
import { ChatSocket } from './ChatSocket.js';

export class ChatSocketsManager {

    #userId = sessionStorage.getItem("userId");
	friendsUrl = apiUrl + 'friends/';
    token = sessionStorage.getItem('pongToken');

    constructor() {
        fetch(this.friendsUrl, {
            method: 'GET',
            headers: {
                "Authorization": this.token
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
            this.#buildSockets(friendList);
            this.#buildFriendshipSocket();
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
    }

    #buildSockets(friendList) {
        const userId = this.#userId
        for (const friend of friendList) {
            ChatSocketsManager.buildSocket(friend)
        }
    }

    static buildSocket(friend) {
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

    #buildFriendshipSocket(friendList) {
        const userId = this.#userId
        const socket = new WebSocket(
            'wss://' +
            'localhost:4000' +
            '/api/ws/friendship/' +
            'friendships' + 
            '/'
        );

        friendshipSocket["socket"] = socket;

        socket.onopen = (e) => { 
            socket.send(JSON.stringify({
                "register": "register",
                "userId": userId
            }))
        }

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data)
            console.log(data)

            if (data.action === "add") {
                // BUILD ACCEPT/REJECT btns.
                this.printIncommingNewFriend(data.sender)
            }

            if (data.action === "accept") {
                const $chat = document.getElementById("chat");
                if ($chat.classList.contains('d-none')) {
                    const $notification = document.getElementById("notificationMsg");
                    $notification.classList.remove('d-none');
                }
                ChatSocketsManager.updateFriendList(data)
            }
        }

        socket.onclose = {}
    }

    static updateFriendList(socketData) {
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
            for (let friend of friendList) {
                if (friend.username === socketData.sender) {
                    ChatSocketsManager.buildSocket(friend);
                    break;
                }
            }
            printFriends(friendList)
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
    }
    
    printIncommingNewFriend(friendName) {
        const $chat = document.getElementById("chat");
        if ($chat.classList.contains('d-none')) {
            const $notification = document.getElementById("notificationMsg");
            $notification.classList.remove('d-none');
        }

        let chatPeople = document.getElementById('friend-list-container');
        if (!chatPeople) {
            return;
        }

        let newFriendCont = document.createElement('div');
        newFriendCont.classList.add('d-flex', 'w-100', 'justify-content-between', 'align-items-center', 'mb-2');
        newFriendCont.setAttribute("data-username", friendName);

        let nameNode = document.createElement('p');
        nameNode.innerText = friendName;
        nameNode.setAttribute("data-username", friendName);
        nameNode.classList.add('m-0');

        newFriendCont.appendChild(nameNode);

        printPendingFriends(friendName, newFriendCont);

        chatPeople.appendChild(newFriendCont);
    }

}