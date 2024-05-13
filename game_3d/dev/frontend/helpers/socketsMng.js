import { GameRemote } from "../../game3D/src/class/remote/GameRemote";
import { navigateTo } from "./navigateto";

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
				"hostId": id,
				"userJwt": sessionStorage.getItem('pongToken')
			}))
		}
		else {
            remoteSocket.send(JSON.stringify({
                'gameReady': true,
				'hostId': id,
				'userJwt': sessionStorage.getItem('pongToken')
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
		if (data.gameEnd) {
			let container = document.getElementById('gameDiv').parentElement;
			let gameDiv = document.querySelector('canvas');
			let winnerDiv = document.createElement('p');
			if (
				(data.gameEnd.winner == 1 && host) ||
				(data.gameEnd.winner == 2 && !host)
			) {
				sessionStorage.setItem('winner', "You");
				navigateTo("home")
				remoteSocket.close();
				// TODO - SEND REQUEST TO ENDPOINT TO REGISTER RESULTS
			} else {
				sessionStorage.setItem('winner', "YOUAREALOSSERMAN");
				navigateTo("home")
				remoteSocket.close();
				const $token = sessionStorage.getItem('pongToken')
				const $resultData = new URLSearchParams();
				$resultData.append('player_1', id);
				$resultData.append('player_2', userId);
				$resultData.append('player_1_score', data.gameEnd.pOneScore);
				$resultData.append('player_2_score', data.gameEnd.pTwoScore);
				$resultData.append('created_at', data.gameEnd.gameStart);
				$resultData.append('updated_at', data.gameEnd.finishTime);
				fetch("http://localhost:8000/api/remote/register-result", {
					method: "POST",
					headers: {
						"Authorization": $token
					},
					body: $resultData
				})
				.then(response => {
					if (!response.ok) {
						throw new Error('Hubo un problema al realizar la solicitud.');
					}
					return response.json();
				})
				.then(data => {
					console.log(data)
				})

			}
		}
	}

	remoteSocket.onclose = function (e) {
		console.log("Connection closed unexpectedly")
	}

}
