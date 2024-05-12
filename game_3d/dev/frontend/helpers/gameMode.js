import { runGame } from "../../game3D/src/old_version/scripts";
import { Game } from "../../game3D/src/class/Game";
import { openNewSocket, openNewSocketTournament } from "./socketsMng";

function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
}

export function playOnline()
{
	if (document.getElementById("selectMode"))
	{
		// Se ejecuta si se clicka el botón de buscar partida online
		const $selectMode = document.getElementById("selectMode");
		$selectMode.classList.add('d-none');
		const $token = sessionStorage.getItem('pongToken');
		fetch("http://localhost:8000/api/remote/find-game", {
			method: "GET",
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
			openNewSocket(data)
		})
	}
	else
	{
		// Se ejecuta si se clicka el botón de buscar torneo
		const $joinTournament = document.getElementById("joinTournament");
		const $nickName = document.getElementById("nickTournament");
		const $errorMessage = document.getElementById("errorMessage");
		if (isEmptyOrSpaces($nickName.value))
		{
			$errorMessage.textContent = "campo obligatorio";
			return ;
		}
		const $token = sessionStorage.getItem('pongToken');
		const $nickNameData = new URLSearchParams();
		$nickNameData.append('nickname', $nickName.value);
		fetch("http://localhost:8000/api/nickname/", {
			method: "POST",
			headers: {
				"Authorization": $token
			},
			body: $nickNameData
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Hubo un problema al realizar la solicitud.');
			}
			return response.json();
		})
		.then(data => {
			console.log(data);
		})

		$joinTournament.classList.add('d-none');
		fetch("http://localhost:8000/api/remote/find-tournament", {
			method: "GET",
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
			openNewSocketTournament(data)
		})
	}
	// const $loading = document.getElementById("loading");
	// $loading.classList.remove('d-none');
}

export function playLocal()
{
	const $token = sessionStorage.getItem('pongToken');
	fetch("http://localhost:8000/api/user_status/", {
		method: "GET",
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
	const $divSelect = document.getElementById("blackDiv");
	$divSelect.classList.add('d-none');
	const $instructionsOne = document.getElementById("instructions");
	$instructionsOne.classList.add('d-none');
	const $instructionsTwo = document.getElementById("instructionsTwoPlayer");
	$instructionsTwo.classList.remove('d-none');

	let game = new Game()
	game.startGame()
}
