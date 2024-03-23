import { Game } from "../../game3D/src/class/Game";
import { runGame } from "../../game3D/src/old_version/scripts";

export function openNewSocket(data) {
	const game = new Game(true)
	const id = data.roomId
	const userId = data.userId

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

	remoteSocket.onopen = function(e) {
		console.log("connection stablished")
		if (!data.fullGame) {
			$loading.classList.remove('d-none');
		}
		else {
            remoteSocket.send(JSON.stringify({
                'gameReady': true
            }));
		}
	}

	remoteSocket.onmessage = function(e) {
		const data = JSON.parse(e.data)
		if (data.gameReady) {
			$loading.classList.add('d-none');
			$divSelect.classList.add('d-none');
			$instructionsOne.classList.add('d-none');
			// runGame() // Replace this function by the Game class using the startRemoteGame(params) method
			game.startRemoteGame(data.ballDir, remoteSocket)
		}
		console.log(data)
	}

	remoteSocket.onclose = function (e) {
		console.log("Connection closed unexpectedly")
	}

}
