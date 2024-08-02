import { playLocal, playOnline } from "./gameMode.js";
import { singPushButton } from "./register.js";
import { logOut, generateQr, changeDataUser } from "./profile.js";
import { loginPushButton, twoFactorPushButton } from "./login.js";
import { addKeyPressListener, closeWinnerMsg } from "./utils.js";
import { changeViewProfile, changeViewData, displayChat } from "./changeView.js";
import { cancelNav, acceptNav } from "./navegationUtils.js";
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
		{ id: "historyTab", event: 'click', handler: changeViewProfile },
		{ id: "infoTab", event: 'click', handler: changeViewProfile },
		{ id: "changeDataView", event: 'click', handler: changeViewData },
		{ id: "changeDataUser", event: 'click', handler: changeDataUser },
		{ id: "cancelNav", event: 'click', handler: cancelNav },
		{ id: "confirmNav", event: 'click', handler: acceptNav }
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
		history.replaceState(null, '', '/');
		if ($localId == userId){
			navigateTo("profile")
		} else
			navigateTo("profile/" + userId)
	};
}