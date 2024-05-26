import { router } from "./router.js";
import { checkJwt, changeUserName, changeState, getAlertConfirm } from "./utils.js";

async function tokenTrue(url)
{
	const $appElement = document.getElementById("app");
	const $chatButton = document.getElementById("displayChat");
	const $navElement = document.getElementById("nav");
	const $currentState = document.getElementById("userStatus").textContent;
	if ($navElement.classList.contains('d-none'))
	{
		$navElement.classList.remove('d-none');
		$chatButton.classList.remove('d-none');
	}
	if ($currentState != "Online")
	{
		const $shouldContinue = await getAlertConfirm($currentState);
		if (!$shouldContinue){
			changeState($currentState);
			return ;
		}
	}
	history.pushState(null, null, url);
	$appElement.innerHTML = "";
	changeState("Online");
	changeUserName();
	router();
}

function  tokenFalse(url)
{
	const $appElement = document.getElementById("app");
	const $chatButton = document.getElementById("displayChat");
	const $navElement = document.getElementById("nav");
	if (!$navElement.classList.contains('d-none'))
	{
		$navElement.classList.add('d-none');
		$chatButton.classList.add('d-none');
	}
	if (url.substring(url.lastIndexOf("/")) != "/signup" && url.substring(url.lastIndexOf("/")) != "/twofactor")
		history.pushState(null, null, "/login");
	else
		history.pushState(null, null, url);
	$appElement.innerHTML = "";
	router();
}

export function navigateTo(url) {
	const $token = sessionStorage.getItem('pongToken');
	console.log(url);
	if ($token)
	{
		checkJwt().then(result => {
			if (result)
				tokenTrue(url);
			else
				tokenFalse(url);
		});
	}
	else
		tokenFalse(url);
}

window.onpopstate = function(event) {
    router();
}