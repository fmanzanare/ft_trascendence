import { runGame } from "../../game3D/src/old_version/scripts";
import { Game } from "../../game3D/src/class/Game";
import { openNewSocket } from "./socketsMng";
import { changeState } from "./utils";

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
		changeState("Searching game")
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
		changeState("Searching tournament")
		$joinTournament.classList.add('d-none');
	}
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
	changeState("In game");
	const $divSelect = document.getElementById("blackDiv");
	$divSelect.classList.add('d-none');
	const $instructionsOne = document.getElementById("instructions");
	$instructionsOne.classList.add('d-none');
	const $instructionsTwo = document.getElementById("instructionsTwoPlayer");
	$instructionsTwo.classList.remove('d-none');

	let game = new Game()
	game.startGame()
}
