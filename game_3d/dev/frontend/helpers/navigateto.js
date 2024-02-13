import { router } from "./router.js";

export function navigateTo(url) {
	const $token = sessionStorage.getItem('pongToken');
	const $chatButton = document.getElementById("displayChat");
	const $navElement = document.getElementById("nav");
	const $appElement = document.getElementById("app");
	if (!$token)
	{
		//comprobar token
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
	}
	else
	{
		const $userName = document.getElementById("userNameNavBar");
		fetch(apiUrl + 'profile/')
		.then(response => {
			if (!response.ok) {
			throw new Error('Hubo un problema al realizar la solicitud.');
			}
			return response.json();
		})
		.then(data => {
			console.log(data);
		})
		.catch(error => {
			console.error('Error:', error);
		});
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
