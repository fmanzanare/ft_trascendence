import { navigateTo } from "./navigateto.js";
import { changeState } from "./utils.js";
import { sockets } from "../index.js"
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
	}
	if (sockets.tournamentSocket != null) {
		console.log("closing tournament socket");
		// sockets.tournamentSocket.send(JSON.stringify({
		// 	"disconnection": true,
		// 	"userId": sessionStorage.getItem("userId")
		// }))
		sockets.tournamentSocket.close();
	}
	if (localGame.local != null) {
		localGame.local.stopGame();
		localGame.local = null;
	}
}