import { router } from "./router.js";
import { checkJwt, changeUserName, changeState, getAlertMessage } from "./utils.js";

function showLoading() {
    const $loadingElement = document.getElementById("loadingApp");
	const $appElement = document.getElementById("app");
    if ($loadingElement) {
        $loadingElement.classList.remove("d-none");
		$appElement.style.display = "none"
    }
}

function hideLoading() {
    const $loadingElement = document.getElementById("loadingApp");
	const $appElement = document.getElementById("app");
    if ($loadingElement) {
        $loadingElement.classList.add("d-none");
		$appElement.style.display = "block"
    }
}

async function tokenTrue(url)
{
	showLoading();
	console.log("hola");
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
		const $modal = document.getElementById('myModal');
		const $textModalMessage = document.getElementById('textModal');
		sessionStorage.setItem('urlAlert', url);
		$textModalMessage.textContent = getAlertMessage($currentState);
		$modal.classList.add('show');
        $modal.style.display = 'block';
		$modal.setAttribute('aria-modal', 'true');
        $modal.setAttribute('aria-hidden', 'false');
        $modal.setAttribute('role', 'dialog');
		hideLoading()
        return;
	}
	history.pushState(null, null, url);
	$appElement.innerHTML = "";
	changeState("Online");
	changeUserName();
	await router();
	hideLoading();
}

function  tokenFalse(url)
{
	showLoading();
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
	hideLoading();
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

window.onpopstate = function(event) {
	const $url = event.target.location.href
	const $currentState = document.getElementById("userStatus").textContent;
	if ($currentState != "Online")
	{
		const $modal = document.getElementById('myModal');
		const $textModalMessage = document.getElementById('textModal');
		sessionStorage.setItem('urlAlert', $url);
		$textModalMessage.textContent = getAlertMessage($currentState);
		$modal.classList.add('show');
		$modal.style.display = 'block';
		$modal.setAttribute('aria-modal', 'true');
		$modal.setAttribute('aria-hidden', 'false');
		$modal.setAttribute('role', 'dialog');

		return;
	}
	showLoading();
    router().finally(hideLoading);
}