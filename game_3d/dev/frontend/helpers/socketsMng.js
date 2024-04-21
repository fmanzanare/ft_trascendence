import { GameRemote } from "../../game3D/src/class/remote/GameRemote";

export function openNewSocket(data) {
	const id = data.roomId;
	const userId = data.userId;
	const host = id == userId;

	const $loading = document.getElementById("loading");
	const $divSelect = document.getElementById("blackDiv");
	const $instructionsOne = document.getElementById("instructions");

	const remoteSocket = new WebSocket(
		'ws://'
		+ 'localhost:8000'
		+ '/ws/remote/'
		+ id
		+ '/'
	)
	const game = new GameRemote(remoteSocket, userId, host)

	remoteSocket.onopen = function(e) {
		console.log("connection stablished")
		if (!data.fullGame) {
			$loading.classList.remove('d-none');
			remoteSocket.send(JSON.stringify({
				"firstConnection": true,
				"hostId": id
			}))
		}
		else {
            remoteSocket.send(JSON.stringify({
                'gameReady': true,
				'hostId': id
            }));
		}
	}

	remoteSocket.onmessage = function(e) {
		const data = JSON.parse(e.data)
		if (data.gameReady) {
			$loading.classList.add('d-none');
			$divSelect.classList.add('d-none');
			$instructionsOne.classList.add('d-none');
			game.startRemoteGame()
		}
		if (data.gameData || data.scoreData) {
			game.getReceivedDataFromWS(data);
		}
	}

	remoteSocket.onclose = function (e) {
		console.log("Connection closed unexpectedly")
		remoteSocket.send(JSON.stringify({
			'closeConnection': true,
			'userId': userId
		}));
	}

}
