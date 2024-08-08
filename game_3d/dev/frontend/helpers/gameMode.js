import { runGame } from "../../game3D/src/old_version/scripts.js";
import { Game } from "../../game3D/src/class/Game.js";
import { openNewSocket, openNewSocketTournament } from "./socketsMng.js";
import { changeState } from "./utils.js";

function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
}

export const localGame = {"local": null};

export async function playOnline()
{
	if (document.getElementById("selectMode"))
	{
		// Se ejecuta si se clicka el botón de buscar partida online
		const $selectMode = document.getElementById("selectMode");
		$selectMode.classList.add('d-none');
		changeState("Searching game")
		const $token = sessionStorage.getItem('pongToken');
		fetch(`${apiUrl}remote/find-game`, {
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
		changeState("Searching tournament")
		const $token = sessionStorage.getItem('pongToken');
		const $nickNameData = new URLSearchParams();
		$nickNameData.append('nickname', $nickName.value);
		await fetch(`${apiUrl}nickname/`, {
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
		await fetch(`${apiUrl}remote/find-tournament`, {
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
	const $loading = document.getElementById("loading");
	$loading.classList.remove('d-none');
}

export function playLocal()
{
	const $token = sessionStorage.getItem('pongToken');
	fetch(`${apiUrl}user_status/`, {
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

	localGame.local = new Game()
	localGame.local.startGame()
}
