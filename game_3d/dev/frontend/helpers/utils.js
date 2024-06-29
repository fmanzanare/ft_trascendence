import { RED_RGTC1_Format } from "three";
import { loginPushButton, singPushButton} from "./register.js";
import { twoFactorPushButton } from "./twoFactor.js"
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

export function changeState(status){
	const $userStatus = document.getElementById("userStatus");
	$userStatus.style.color = "blue"
	switch (status) {
        case "Searching game":
            $userStatus.textContent = "Searching game"
            break;
        case "Searching tournament":
            $userStatus.textContent = "Searching tournament"
            break;
        case "In game":
            $userStatus.textContent = "In game"
			$userStatus.style.color = "#ff5252"
            break;
        case "In tournament":
            $userStatus.textContent = "In tournament"
			$userStatus.style.color = "#ff5252"
            break;
        default:
            $userStatus.textContent = "Online"
			$userStatus.style.color = "#56ba6f"
            break;
    }
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