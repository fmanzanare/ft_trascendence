import { GameRemote } from "../../game3D/src/class/remote/GameRemote.js";
import { navigateTo } from "./navigateto.js";
import { changeState } from "./utils.js";
import { sockets } from "../index.js"

export function openNewSocket(data) {
	const id = data.roomId;
	const userId = data.userId;
	const host = id == userId;

	const $loading = document.getElementById("loading");
	const $divSelect = document.getElementById("blackDiv");
	const $instructionsOne = document.getElementById("instructions");

	const remoteSocket = new WebSocket(
		'wss://'
		+ 'localhost'
		+ '/api/ws/remote/'
		+ id
		+ '/'
	)
	sockets.gameSocket = remoteSocket;
	const game = new GameRemote(remoteSocket, userId, host)

	remoteSocket.onopen = function(e) {
		console.log("connection stablished")
		$loading.classList.remove('d-none');
		remoteSocket.send(JSON.stringify({
			"register": true,
			"hostId": id,
			"userId": userId,
			"userJwt": sessionStorage.getItem('pongToken')
		}))
	}

	remoteSocket.onmessage = function(e) {
		console.log(e.data)
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
		if (data.disconnection) {
			sessionStorage.setItem('winner', "You");
			changeState('Online');
			navigateTo("home")
			remoteSocket.close();
		}
		if (data.gameEnd) {
			if (
				(data.gameEnd.winner == 1 && host) ||
				(data.gameEnd.winner == 2 && !host)
			) {
				sessionStorage.setItem('winner', "You");
			} else {
				sessionStorage.setItem('winner', "YOUAREALOSSERMAN");
			}
			changeState('Online');
			navigateTo("home")
			remoteSocket.close();
			const $token = sessionStorage.getItem('pongToken')
			fetch(`${apiUrl}online-status/`, {
				method: "POST",
				headers: {
					"Authorization": $token
				}
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Hubo un problema al realizar la solicitud.');
				}
			})
		}
	}

	remoteSocket.onclose = function (e) {
		console.log("Connection closed")
		const $token = sessionStorage.getItem('pongToken')
		fetch(`${apiUrl}online-status/`, {
			method: "POST",
			headers: {
				"Authorization": $token
			}
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Hubo un problema al realizar la solicitud.');
			}
		})
	}

}

export function openNewSocketTournament(data) {

	const id = data.roomId;
	const userId = data.userId;
	const host = id == userId;
	let matchId = 0;

	const $loading = document.getElementById("loading");

	const remoteSocket = new WebSocket(
		'wss://'
		+ 'localhost'
		+ '/api/ws/tournament/'
		+ id
		+ '/'
	)
	sockets.tournamentSocket = remoteSocket;
	let game = new GameRemote(remoteSocket, userId, host)

	remoteSocket.onopen = function(e) {
		console.log("connection stablished")
		remoteSocket.send(JSON.stringify({
			'register': true,
			'hostId': id,
			'userId': userId,
			'userJwt': sessionStorage.getItem('pongToken')
		}));
	}

	remoteSocket.onmessage = function(e) {
		const data = JSON.parse(e.data)

		if (data.bracket) {
			if (data.bracket.match1Ids.split(',')[0] == userId || data.bracket.match1Ids.split(',')[1] == userId ) {
				matchId = 1
			} else {
				matchId = 2
			}
		}

		if (data.ids) {
			console.log(data)
			if (data.ids.gameReady && (data.ids.pOneId == userId || data.ids.pTwoId == userId)) {
				$loading.classList.add('d-none');
				$loading.setAttribute("id", "gameDiv")
				game.startRemoteGame()
			}
		}

		if (data.gameData || data.scoreData) {
			if (data.matchId == matchId) {
				game.getReceivedDataFromWS(data);
			}
		}

		if (data.semifinalWinners) {
			let gameCanva = document.querySelector('canvas');
			gameCanva.remove();
			if (userId == data.pOneId) {
				game = new GameRemote(remoteSocket, userId, true);
				game.startRemoteGame()
				matchId = 3
			} else if (userId == data.pTwoId) {
				game = new GameRemote(remoteSocket, userId, false);
				game.startRemoteGame()
				matchId = 3
			} else {
				console.log("Sorry, you lost");
				remoteSocket.close();
			}
		}

		if (data.finalWinner) {
			if (userId == data.tournamentWinner) {
				console.log("Congratulations! You won the tournament");
				const $token = sessionStorage.getItem('pongToken')
				fetch(`${apiUrl}remote/register-tournament-win`, {
					method: "POST",
					headers: {
						"Authorization": $token
					}
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
				remoteSocket.close()
			} else {
				console.log("Ups! You lost the tournamnet");
				remoteSocket.close()
			}
		}
	}

	remoteSocket.onclose = function (e) {
		console.log("Connection closed")
		const $token = sessionStorage.getItem('pongToken')
		fetch(`${apiUrl}online-status/`, {
			method: "POST",
			headers: {
				"Authorization": $token
			}
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Hubo un problema al realizar la solicitud.');
			}
		})
	}
}