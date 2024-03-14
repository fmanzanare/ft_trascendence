import { RED_RGTC1_Format } from "three";
import { loginPushButton, singPushButton, twoFactorPushButton } from "./register.js";

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
			throw new Error('Hubo un problema al realizar la solicitud.');
		}
		return response.json();
	})
	.then(data => {
		$userName.textContent = data.context.user.display_name;
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