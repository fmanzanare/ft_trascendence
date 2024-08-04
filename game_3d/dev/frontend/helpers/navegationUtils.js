import { navigateTo } from "./navigateto.js";
import { changeState, getAlertMessage } from "./utils.js";
import { sockets } from "../index.js";
import { localGame } from "./gameMode.js";

export function cancelNav()
{
	const $modal = document.getElementById('myModal');
	sessionStorage.removeItem('urlAlert');
    $modal.classList.remove('show');
    $modal.style.display = 'none';
}

export function acceptNav()
{
	const $modal = document.getElementById('myModal');
	const $url = sessionStorage.getItem('urlAlert')
	sessionStorage.removeItem('urlAlert');
    $modal.classList.remove('show');
    $modal.style.display = 'none';
	changeState("Online");
	navigateTo($url);
	if (sockets.gameSocket != null) {
		console.log("closing game socket");
		// sockets.gameSocket.send(JSON.stringify({
		// 	"disconnection": true,
		// 	"userId": sessionStorage.getItem("userId")
		// }))
		sockets.gameSocket.close();
		sockets.gameSocket = null;
	}
	if (sockets.tournamentSocket != null) {
		console.log("closing tournament socket");
		// sockets.tournamentSocket.send(JSON.stringify({
		// 	"disconnection": true,
		// 	"userId": sessionStorage.getItem("userId")
		// }))
		sockets.tournamentSocket.close();
		sockets.tournamentSocket = null;
	}
	if (localGame.local != null) {
		localGame.local.stopGame();
		localGame.local = null;
	}
}

export function showModal()
{
	const $modal = document.getElementById("myModal");
    const $textModalMessage = document.getElementById("textModal");
    const $currentState = document.getElementById("userStatus").textContent;
    $textModalMessage.textContent = getAlertMessage($currentState);
    $modal.classList.add("show");
    $modal.style.display = "block";
    $modal.setAttribute("aria-modal", "true");
    $modal.setAttribute("aria-hidden", "false");
    $modal.setAttribute("role", "dialog");
}
