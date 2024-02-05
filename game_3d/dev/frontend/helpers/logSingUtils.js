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
			sessionStorage.setItem('miToken', 'hola');
			navigateTo("/home");
		}
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}

export function singupPushButton()
{
	const $name = document.getElementById("Name");
	const $pass = document.getElementById("PassWord");
	const $passRep = document.getElementById("PassWordRep");
	const $userName = document.getElementById("UserName");
	const $singupUrl = apiUrl + '/register';
	const $singupData = new URLSearchParams();
	$singupData.append('display_name', $name.value);
	$singupData.append('username', $userName.value);
	$singupData.append('password1', $pass.value);
	$singupData.append('password2', $passRep.value);
	fetch($singupUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: $singupData
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
		navigateTo("/login");
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}

export function logOut()
{
	const $fakeClickElement = document.querySelector("[data-link][href='/home']");
	sessionStorage.removeItem('miToken');
	if ($fakeClickElement) {
        $fakeClickElement.click();
    }
}
