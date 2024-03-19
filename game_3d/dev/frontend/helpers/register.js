import { navigateTo } from "./navigateto";
import { changeUserName } from "./utils";

export function loginPushButton()
{
	const $name = document.getElementById("UserName");
	const $pass = document.getElementById("PassWord");
	const $errorMessage = document.getElementById("errorMessage");
	const $loginUrl = apiUrl + 'login/';
	const $loginData = new URLSearchParams();
	const $elements = [$name, $pass];

	$loginData.append('username', $name.value);
	$loginData.append('password', $pass.value);
	fetch($loginUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: $loginData
	})
	.then(response => {
		if (!response.ok) {
			throw new Error(`Error en la solicitud: ${response.status}`);
		}
		return response.json()
	})
	.then(data => {
		if (data.success) {
			if (data.redirect_url == "pass2fa")
			{
				sessionStorage.setItem('user', $name.value);
				navigateTo("/twofactor");
			}
			else
			{
				sessionStorage.setItem('pongToken', data.context.jwt);
				changeUserName();
				navigateTo("/home");
			}
		}
		else
		{
			if (data.message == "Username or password is incorrect")
			{
				$elements.forEach(element => {
					element.classList.add("border-danger");
					$errorMessage.textContent = "Username or password is incorrect";
				});
			}
		}
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}

export function singPushButton()
{
	const $name = document.getElementById("Name");
	const $username = document.getElementById("UserName");
	const $pass = document.getElementById("PassWord");
	const $passTwo = document.getElementById("PassWordRep");
	const $errorMessage = document.getElementById("errorMessage");
	const $elements = [$name, $username, $pass, $passTwo];

	$elements.forEach(element => {
		if (element.value == "")
		{
			element.classList.add("border-danger");
			$errorMessage.textContent = "Mandatory fields";
		}
		else
			if (element.classList.contains("border-danger"))
				element.classList.remove("border-danger");
	});
	const $singUpUrl = apiUrl + 'register/';
	const $singUpData = new URLSearchParams();
	$singUpData.append('display_name', $name.value);
	$singUpData.append('username', $username.value);
	$singUpData.append('password1', $pass.value);
	$singUpData.append('password2', $passTwo.value);
	fetch($singUpUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: $singUpData
	})
	.then(response => {
		if (!response.ok) {
			throw new Error(`Error en la solicitud: ${response.status}`);
		}
		return response.json()
	})
	.then(data => {
		console.log(data)
		console.log('Registro exitoso:', data.success);
		if (data.success)
			navigateTo("/home");
		else
		{
			const $errors = data.context.errors;
			const $startIndex = $errors.indexOf("code") + 8;
			const $endIndex = $errors.indexOf('"', $startIndex);
			const $error = $errors.substring($startIndex, $endIndex);
			console.log($error);
			if ($error == "password_mismatch")
			{
				$pass.classList.add("border-danger");
				$passTwo.classList.add("border-danger");
				$errorMessage.textContent = "Passwords dont match";
			}
			else if ($error == "unique")
			{
				$username.classList.add("border-danger");
				$errorMessage.textContent = "Username in use";
			}
			else if ($error == "password_too_common")
			{
				$pass.classList.add("border-danger");
				$errorMessage.textContent = "Insecure password";
			}
		}
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}

export function twoFactorPushButton()
{
	const $key = document.getElementById("doubleFK");
	const $userName = sessionStorage.getItem("user");
	const $doubleFactorUrl = apiUrl + 'submit2fa/';
	const $doubleFactorData = new URLSearchParams();
	$doubleFactorData.append('code', $key.value);
	$doubleFactorData.append('user', $userName);
	console.log($userName, $key.value);
	fetch($doubleFactorUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: $doubleFactorData
	})
	.then(response => {
		if (!response.ok) {
			throw new Error(`Error en la solicitud: ${response.status}`);
		}
		return response.json()
	})
	.then(data => {
		if (data.success) {
			sessionStorage.setItem('pongToken', data.context.jwt);
			sessionStorage.removeItem('user');
			changeUserName();
			navigateTo("/home");
		}
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}

export function logOut()
{
	const $token = sessionStorage.getItem('pongToken');
	const $logoutUrl = apiUrl + 'logout/';
	fetch($logoutUrl, {
		method: 'GET',
		headers: {
			"Authorization": $token
		}
	})
	.then(response => {
		if (!response.ok) {
			throw new Error(`Error en la solicitud: ${response.status}`);
		}
		return response.json()
	})
	.then(data => {
		console.log(data);
		sessionStorage.removeItem('pongToken');
		navigateTo("/home");
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}
