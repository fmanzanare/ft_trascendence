import { GameRemote } from "../../game3D/src/class/remote/GameRemote.js";
import { navigateTo } from "./navigateto.js";
import { changeState } from "./statusUser.js";
import { sockets } from "../index.js"

export function openNewSocket(data) {
	const id = data.roomId;
	const userId = data.userId;
	const host = id == userId;

	console.log(`UserId: ${userId}`)
	console.log(`HostId: ${id}`)

	const $loading = document.getElementById("loading");
	const $divSelect = document.getElementById("blackDiv");
	const $instructionsOne = document.getElementById("instructions");

	const remoteSocket = new WebSocket(
		'wss://'
		+ 'localhost:4000'
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
		const data = JSON.parse(e.data)

		if (data.gameReady) {
			$loading.classList.add('d-none');
			$divSelect.classList.add('d-none');
			$instructionsOne.classList.add('d-none');
			changeState("In game");
			game.names.pOneName = data["pOneName"];
			game.names.pTwoName = data["pTwoName"];
			game.startRemoteGame()
		}
		if (data.gameData || data.scoreData) {
			game.getReceivedDataFromWS(data);
			console.log(data);
		}
		if (data.startingGame) {
			game.drawCountdown(data)
		}
		if (data.disconnection) {
			sessionStorage.setItem('winner', "You");
			changeState('Online');
			navigateTo("home")
			remoteSocket.close();
			sockets.gameSocket = null;
		}
		if (data.gameEnd) {
			if (data.winner == userId) {
				sessionStorage.setItem('winner', "You");
			} else {
				sessionStorage.setItem('winner', "YOUAREALOSSERMAN");
			}
			changeState('Online');
			navigateTo("home")
			remoteSocket.close();
			sockets.gameSocket = null;
			const $token = sessionStorage.getItem('pongToken')
			fetch(`${apiUrl}online-status/`, {
				method: "POST",
				headers: {
					"Authorization": $token
				}
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Unexpected error.');
				}
			})
		}
	}

	remoteSocket.onclose = function (e) {
		console.log("Connection closed")
		game.removeEventListeners();
		const $token = sessionStorage.getItem('pongToken')
		fetch(`${apiUrl}online-status/`, {
			method: "POST",
			headers: {
				"Authorization": $token
			}
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Unexpected error.');
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
		+ 'localhost:4000'
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
		const $blackDiv = document.getElementById("blackDivTournament");
		const $titleDiv = document.getElementById("playerWinnerTournament");
		const $textDiv = document.getElementById("textWinnerTournamet");
		const $btnDiv = document.getElementById("btnCloseWinnerTournament");
		const gameCanva = document.querySelector('canvas');

		if (data.bracket) {
			console.log(data);
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
				changeState("In game");
				game.names.pOneName = data.ids.pOneName;
				game.names.pTwoName = data.ids.pTwoName;
				game.startRemoteGame()
			}
		}

		if (data.gameData || data.scoreData) {
			if (data.matchId == matchId) {
				game.getReceivedDataFromWS(data);
			}
		}

		if (data.startingGame) {
			game.drawCountdown(data)
		}

		if (data.semifinalWinners) {
			$blackDiv.classList.add("d-none")
			if (gameCanva)
				gameCanva.remove();
			if (userId == data.pOneId || userId == data.pTwoId) {
				game = new GameRemote(remoteSocket, userId, true);
				game.names.pOneName = data["pOneName"];
				game.names.pTwoName = data["pTwoName"];
				game.startRemoteGame()
				matchId = 3
			} else {
				$blackDiv.classList.remove("d-none")
				$btnDiv.classList.remove("d-none")
				$titleDiv.textContent = "YOU LOST"
				$textDiv.textContent = "You can now leave the tournament"
				console.log("Sorry, you lost");
				remoteSocket.close();
				sockets.tournamentSocket = null;
			}
		}

		if (data.finalWinner) {
			$blackDiv.classList.remove("d-none")
			if (gameCanva)
				gameCanva.remove();
			if (userId == data.tournamentWinner) {
				// TODO - Show a message on the screen.
				$btnDiv.classList.remove("d-none")
				$titleDiv.textContent = "YOU WIN"
				$textDiv.textContent = "Congratulation! You won the tournament!"
				console.log("Congratulations! You won the tournament");
				remoteSocket.close()
				sockets.tournamentSocket = null;
			} else {
				// TODO - Show a message on the screen.
				$btnDiv.classList.remove("d-none")
				$titleDiv.textContent = "YOU LOST"
				$textDiv.textContent = "Ups! You lost the tournamnet"
				console.log("Ups! You lost the tournamnet");
				remoteSocket.close()
				sockets.tournamentSocket = null;
			}
		}

		if (data.disconnection) {
			// TODO - Show a message on the screen.
			gameCanva.remove();
			$blackDiv.classList.remove("d-none")
			$titleDiv.textContent = "YOU WIN"
			$textDiv.textContent = "The other player has disconnected! Please wait for the next match."
			console.log("the other player has disconnected");
		}

		if (data.cancelTournament) {
			remoteSocket.close();
			sockets.tournamentSocket = null;
			changeState('Online');
			navigateTo("home")
		}
	}

	remoteSocket.onclose = function (e) {
		console.log("Connection closed")
		game.removeEventListeners()
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