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
			sessionStorage.setItem('pongToken', data.context.jwt);
			sessionStorage.setItem('userId', data.context.userId);
			changeUserName();
			// cargar desde el modelo los mensajes para llenar la variable global
			navigateTo("/home");
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
			else
				navigateTo("/twofactor");
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

function getBase64Image(img)
{
	var canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	var dataURL = canvas.toDataURL();
	return dataURL;
}

function conectServerChange(img)
{
	const $username = document.getElementById("UserNameChange");
	const $token = sessionStorage.getItem('pongToken');
	const $profileUrl = apiUrl + 'profile/';
	const $profileData = new URLSearchParams();
	$profileData.append('avatar_base64', img);
	$profileData.append('display_name', $username.value);
	fetch($profileUrl, {
		method: 'POST',
		headers: {
			"Authorization": $token
		},
		body: $profileData
	})
	.then(response => {
		if (!response.ok) {
			throw new Error(`Error en la solicitud: ${response.status}`);
		}
		return response.json()
	})
	.then(data => {
		if (data.success) {
			changeUserName();
			navigateTo("/profile");
		}
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}

export function changeDataUser()
{
	const $picture = document.getElementById("profilePictureChange").files[0];
	let base64;
	if ($picture !== undefined) {
		const $img = new Image();
		$img.onload = function() {
			base64 = getBase64Image($img);
			conectServerChange(base64);
		};
		$img.src = URL.createObjectURL($picture);
	}
	else
	{
		base64 = "";
		conectServerChange(base64);
	}
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
