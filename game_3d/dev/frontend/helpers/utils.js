import { loginPushButton, singPushButton, twoFactorPushButton } from "./register.js";

export function displayChat()
{
	const $chatButton = document.getElementById("displayChat");
	const $chat = document.getElementById("chat");
	if($chat.classList.contains('d-none'))
	{
		$chatButton.classList.add('d-none');
		$chat.classList.remove('d-none');
	}
	else
	{
		$chatButton.classList.remove('d-none');
		$chat.classList.add('d-none');
	}
}

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
