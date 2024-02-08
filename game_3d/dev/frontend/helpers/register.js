import { navigateTo } from "./navigateto";

export function loginPushButton()
{
	const $name = document.getElementById("UserName");
	const $pass = document.getElementById("PassWord");
	const $loginUrl = apiUrl + 'login/';
	const $loginData = new URLSearchParams();
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
		console.log(data)
		console.log('Inicio de sesión exitoso:', data.success);
		if (data.logged_in) {
			sessionStorage.setItem('pongToken', 'hola');
			navigateTo("/home");
		}
		else
		{
			//si doblefact es on
			navigateTo("/twofactor");
			//else(mostrar el error)
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
	const $errorDiv = document.getElementById("errorDiv");
	const $errorMessage = document.getElementById("errorMessage");
	const $var = [$name, $username, $pass, $passTwo];

	$var.forEach(element => {
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
		console.log('Inicio de sesión exitoso:', data.success);
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
	/*const $doubleFactorUrl = apiUrl + 'doublefactor/';
	const $doubleFactorData = new URLSearchParams();
	$doubleFactorData.append('doubleFK', $key.value);
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
		console.log(data)
		console.log('Inicio de sesión exitoso:', data.success);
		if (data.logged_in) {
			sessionStorage.setItem('pongToken', 'hola');
		}
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});*/
	sessionStorage.setItem('pongToken', 'hola');
	navigateTo("/home");
}

export function logOut()
{
	const $fakeClickElement = document.querySelector("[data-link][href='/home']");
	sessionStorage.removeItem('pongToken');
	if ($fakeClickElement) {
        $fakeClickElement.click();
    }
}
