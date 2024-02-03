import { router } from "./router.js";

export function navigateTo(url) {
	const $token = sessionStorage.getItem('miToken');
	const $chatButton = document.getElementById("displayChat");
	const $navElement = document.getElementById("nav");
	const $appElement = document.getElementById("app");
	if (!$token && url.substring(url.lastIndexOf("/")) != "/signup")
	{
		if (!$navElement.classList.contains('d-none'))
		{
			$navElement.classList.add('d-none');
			$chatButton.classList.add('d-none');
		}
		history.pushState(null, null, "/login");
	}
	else if (!$token && url.substring(url.lastIndexOf("/")) == "/signup")
	{
		history.pushState(null, null, url);
	}
	else
	{
		if ($navElement.classList.contains('d-none'))
		{
			$navElement.classList.remove('d-none');
			$chatButton.classList.remove('d-none');
		}
		history.pushState(null, null, url);
	}
	$appElement.innerHTML = "";
	router();
}
