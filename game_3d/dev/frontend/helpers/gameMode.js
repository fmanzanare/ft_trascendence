import { Game } from "../../game3D/src/class/Game.js";
import { navigateTo, navigateToWhenInvitationAccepted } from "./navigateto.js";
import { openNewSocket, openNewSocketTournament } from "./socketsMng.js";
import { changeState } from "./statusUser.js";

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
		const $loading = document.getElementById("loading");
		$loading.classList.remove('d-none');
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
		const $tournamentUrl = apiUrl + 'nickname/';
		const $nickNameData = new URLSearchParams();
		$nickNameData.append('nickname', $nickName.value);
		fetch($tournamentUrl, {
			method: "POST",
			headers: {
				"Authorization": $token
			},
			body: $nickNameData
		})
			.then((response) => {
				if (!response.ok) {
					if (response.status === 409) {
						return response.json().then((errorData) => {
							return Promise.reject(errorData.error);
						});
					} else {
						throw new Error(`Error en la solicitud: ${response.status}`);
					}
				}
				return response.json();
			})
			.then((data) => {
				if (data) {
					changeState("Searching tournament")
					$joinTournament.classList.add('d-none');
					return fetch(`${apiUrl}remote/find-tournament`, {
						method: "GET",
						headers: {
							"Authorization": $token
						}
					});
				} else {
					return Promise.reject(errorData.error);
				}
			})
			.then((tournamentResponse) => {
				if (!tournamentResponse.ok) {
					throw new Error('Hubo un problema al realizar la solicitud.');
				}
		
				return tournamentResponse.json();
			})
			.then((tournamentData) => {
				openNewSocketTournament(tournamentData);
				const $loading = document.getElementById("loading");
				$loading.classList.remove('d-none');
			})
			.catch((error) => {
				$errorMessage.textContent = error || "unknow error.";
			});
	}
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

export function acceptGameInvitation(hostId, userId) {
	// TODO - Check if it works when user is in playing status.
	navigateToWhenInvitationAccepted('home').then((res) => {
		const data = {
			roomId: hostId,
			userId: userId
		}
		changeState('In game')
		openNewSocket(data)
	})
}
