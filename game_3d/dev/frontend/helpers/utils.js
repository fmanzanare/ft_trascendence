import { singPushButton} from "./register.js";
import { loginPushButton, twoFactorPushButton } from "./login.js";
import { navigateTo } from "./navigateto.js";

function LogInEnterKeyPress(event)
{
	if (event.key === "Enter") {
		event.preventDefault();
		loginPushButton();
	}
}

function singUpEnterKeyPress(event)
{
	if (event.key === "Enter") {
		event.preventDefault();
		singPushButton();
	}
}

function twoFactorEnterKeyPress(event)
{
	if (event.key === "Enter") {
		event.preventDefault();
		twoFactorPushButton();
	}
}

export function getAlertMessage(state) {
	let message;
	switch (state) {
		case "Searching game":
			message = "Are you sure you want to stop searching for a game?";
			break;
		case "Searching tournament":
			message = "Are you sure you want to stop searching for a tournament?";
			break;
		case "In game":
			message = "Are you sure you want to leave the game?";
			break;
		case "In tournament":
			message = "Are you sure you want to leave the tournament?";
			break;
	};
	return(message);
}

export function closeWinnerMsg(){
	sessionStorage.removeItem('winner');
	navigateTo("/home")
}

export function addKeyPressListener() {
	if (document.getElementById("LogInDiv"))
	{
		document.getElementById("LogInDiv").addEventListener("keypress", LogInEnterKeyPress);
	}
	else if (document.getElementById("singUpDiv"))
	{
		document.getElementById("singUpDiv").addEventListener("keypress", singUpEnterKeyPress);
	}
	else if (document.getElementById("twoFactorDiv"))
	{
		document.getElementById("twoFactorDiv").addEventListener("keypress", twoFactorEnterKeyPress);
	}
}

export function changeUserName()
{
	const $token = sessionStorage.getItem('pongToken');
	const $userName = document.getElementById("userNameNavBar");
	const $profileUrl = apiUrl + 'profile/';
	
	return fetch($profileUrl, {
		method: "GET",
		headers: {
			"Authorization": $token
		}
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Unexpected error.');
		}
		return response.json();
	})
	.then(data => {
		$userName.textContent = data.context.user.username;
		sessionStorage.setItem('userName', data.context.user.display_name);
	})
	.catch(error => {
		console.error('Error:', error);
	});
}

export function checkJwt()
{
	const $token = sessionStorage.getItem('pongToken');
	const $jwtUrl = apiUrl + 'check_jwt/';
	return fetch($jwtUrl, {
		method: "GET",
		headers: {
			"Authorization": $token
		}
	})
	.then(response => {
		if (!response.ok)
			return (false);
		else
			return (true);
	})
}