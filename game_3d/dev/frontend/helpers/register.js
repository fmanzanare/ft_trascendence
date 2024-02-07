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
			$fakeClickElement.click();
		}
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});*/
	sessionStorage.setItem('pongToken', 'hola');
	$fakeClickElement.click();
}

export function logOut()
{
	const $fakeClickElement = document.querySelector("[data-link][href='/home']");
	sessionStorage.removeItem('pongToken');
	if ($fakeClickElement) {
        $fakeClickElement.click();
    }
}
