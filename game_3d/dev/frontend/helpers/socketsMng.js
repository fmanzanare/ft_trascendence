import { removeGame, runGame } from "../../game3D/src/scripts"

export function openNewSocket(data) {
	const id = data.userId
	console.log(id)

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
			runGame()
		}
		console.log(data)
	}

	remoteSocket.onclose = function (e) {
		console.log("Connection closed unexpectedly")
	}
}
