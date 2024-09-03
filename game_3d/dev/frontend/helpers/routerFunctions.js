import { playLocal, playOnline } from "./gameMode.js";
import { singPushButton } from "./register.js";
import { generateQr, changeDataUser } from "./profile.js";
import { logOut } from "./logOut.js";
import { loginPushButton, twoFactorPushButton } from "./login.js";
import { addKeyPressListener, closeWinnerMsg } from "./utils.js";
import { changeViewProfile, changeViewData, displayChat, quitAlert } from "./changeView.js";
import { cancelNav, acceptNav, showModal, closeTournament } from "./navegationUtils.js";
import { navigateTo } from "./navigateto.js";

export async function routerFunctions(){
	const buttons = [
		{ id: "loginButton", event: 'click', handler: loginPushButton },
		{ id: "twoFactorButton", event: 'click', handler: twoFactorPushButton },
		{ id: "singUpButton", event: 'click', handler: singPushButton },
		{ id: "logOut", event: 'click', handler: logOut },
		{ id: "displayChat", event: 'click', handler: displayChat },
		{ id: "hideChat", event: 'click', handler: displayChat },
		{ id: "playOnline", event: 'click', handler: playOnline },
		{ id: "playLocal", event: 'click', handler: playLocal },
		{ id: "btnCloseWinner", event: 'click', handler: closeWinnerMsg },
		{ id: "historyTab", event: 'click', handler: () => changeViewProfile("history") },
		{ id: "infoTab", event: 'click', handler: () => changeViewProfile("info") },
		{ id: "statisticsTab", event: 'click', handler: () => changeViewProfile("statistics") },
		{ id: "changeDataView", event: 'click', handler: changeViewData },
		{ id: "changeDataUser", event: 'click', handler: changeDataUser },
		{ id: "cancelNav", event: 'click', handler: cancelNav },
		{ id: "confirmNav", event: 'click', handler: acceptNav },
		{ id: "cancelTournament", event: 'click', handler:showModal},
		{ id: "cancelGame", event: 'click', handler:showModal},
		{ id: "btnCloseWinnerTournament", event: 'click', handler:closeTournament},
		{ id: "btnQuitAlert", event: 'click', handler:quitAlert}
	];
	
	buttons.forEach(button => {
		const element = document.getElementById(button.id);
		if (element) {
			element.addEventListener(button.event, button.handler);
		}
	});

	const $winner = sessionStorage.getItem('winner');
	if ($winner)
	{
		const $divSelect = document.getElementById("blackDiv");
		const $divWinner = document.getElementById("winnerDiv");
		const $playerWinner = document.getElementById("playerWinner");
		if ($winner == "YOUAREALOSSERMAN")
			$playerWinner.textContent = "You loss"
		else
			$playerWinner.textContent = $winner + " win"
		$divSelect.classList.add('d-none');
		$divWinner.classList.remove('d-none');
	}
	if (document.getElementById("qrCode"))
		generateQr();
	addKeyPressListener();

	window.goToUserProfile = (userId) => {
		const $localId = sessionStorage.getItem("userId")
		if ($localId == userId) {
			navigateTo("/profile");
		} else {
			navigateTo("/profile/" + userId);
		}
	};
}