import { runGame } from "../../game3D/src/old_version/scripts";
import { Game } from "../../game3D/src/class/Game";
import { openNewSocket } from "./socketsMng";

export function playOnline()
{
	if (document.getElementById("selectMode"))
	{
		// Se ejecuta si se clicka el botón de buscar partida online
		const $selectMode = document.getElementById("selectMode");
		$selectMode.classList.add('d-none');
	}
	else
	{
		// Se ejecuta si se clicka el botón de buscar torneo
		const $joinTournament = document.getElementById("joinTournament");
		$joinTournament.classList.add('d-none');
	}
	const $token = sessionStorage.getItem('pongToken');
	fetch("http://10.13.5.6:8000/api/remote/find-game", {
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
	const $divSelect = document.getElementById("blackDiv");
	$divSelect.classList.add('d-none');
	const $instructionsOne = document.getElementById("instructions");
	$instructionsOne.classList.add('d-none');
	const $instructionsTwo = document.getElementById("instructionsTwoPlayer");
	$instructionsTwo.classList.remove('d-none');

	let game = new Game(false)
	game.startGame()
}
