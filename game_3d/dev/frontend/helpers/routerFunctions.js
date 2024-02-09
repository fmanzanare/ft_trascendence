import { displayChat } from "./utils.js";
import { playLocal, playOnline } from "./gameMode.js";
import { loginPushButton, singPushButton, twoFactorPushButton, logOut } from "./register.js";
import { addKeyPressListener } from "./utils.js";

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
	];
	
	buttons.forEach(button => {
		const element = document.getElementById(button.id);
		if (element) {
			element.addEventListener(button.event, button.handler);
		}
	});
	addKeyPressListener();
}