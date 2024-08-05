import { router } from "./router.js";
import { login42 } from "./login.js";
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
	const $appElement = document.getElementById("app");
	const $chatButton = document.getElementById("displayChat");
	const $navElement = document.getElementById("nav");
	const $currentState = document.getElementById("userStatus").textContent;

	if ($currentState != "Online") {
        handleOfflineState(url);
        return;
    }

	if ($navElement.classList.contains('d-none'))
	{
		$navElement.classList.remove('d-none');
		$chatButton.classList.remove('d-none');
	}

	if (window.location.pathname != url) {
		const $currentPath = window.location.pathname;
		if ($currentPath == '/login') {
            history.replaceState(null, '', url);
		} else {
			history.pushState(null, '', url);
		}
    }

	$appElement.innerHTML = "";
	changeState("Online");
	changeUserName();
	await router();
	hideLoading();
}

async function  tokenFalse(url)
{
	showLoading();
	const $appElement = document.getElementById("app");
	const $chatButton = document.getElementById("displayChat");
	const $navElement = document.getElementById("nav");

	let pippo = new URL(window.location.href);
	console.log(pippo);
	let code = pippo.searchParams.get("code")
	if (code) {
		console.log("hola42");
		login42(code);
		return;
	}

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
	await router();
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

function handleOfflineState(url) {
    const $modal = document.getElementById("myModal");
    const $textModalMessage = document.getElementById("textModal");
    const $currentState = document.getElementById("userStatus").textContent;
    sessionStorage.setItem("urlAlert", url);
    $textModalMessage.textContent = getAlertMessage($currentState);
    $modal.classList.add("show");
    $modal.style.display = "block";
    $modal.setAttribute("aria-modal", "true");
    $modal.setAttribute("aria-hidden", "false");
    $modal.setAttribute("role", "dialog");
    hideLoading();
}

window.onpopstate = function(event) {
	showLoading();
	const $url = event.target.location.href
	const $currentState = document.getElementById("userStatus").textContent;
	if ($currentState != "Online")
	{
		handleOfflineState($url)
		return;
	}
    router().finally(hideLoading);
}