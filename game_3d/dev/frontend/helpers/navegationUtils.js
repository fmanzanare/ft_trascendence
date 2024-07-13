import { navigateTo } from "./navigateto.js";
import { changeState } from "./utils.js";
import { sockets } from "../index.js"

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
	console.log(sockets.gameSocket);
	if (sockets.gameSocket != null) {
		sockets.gameSocket.send(JSON.stringify({
			"disconnection": true,
		}))
		sockets.gameSocket.close();
	}
	if (sockets.tournamentSocket != null) {
		sockets.tournamentSocket.send(JSON.stringify({
			"disconnection": true,
		}))
		sockets.tournamentSocket.close();
	}
}