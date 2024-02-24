import { router } from "./router.js";
import { checkJwt, changeUserName } from "./utils.js";

function tokenTrue(url)
{
	const $appElement = document.getElementById("app");
	const $chatButton = document.getElementById("displayChat");
	const $navElement = document.getElementById("nav");
	if ($navElement.classList.contains('d-none'))
	{
		$navElement.classList.remove('d-none');
		$chatButton.classList.remove('d-none');
	}
	history.pushState(null, null, url);
	$appElement.innerHTML = "";
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
	else if (url.substring(url.lastIndexOf("/")) == "/signup")
		history.pushState(null, null, url);
	else
		history.pushState(null, null, url);
	$appElement.innerHTML = "";
	router();
}

export function navigateTo(url) {
	const $token = sessionStorage.getItem('pongToken');
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
