import {changeUserName} from "./utils.js";
import { navigateTo } from "./navigateto.js";

export function twoFactorPushButton()
{
	const $key = document.getElementById("doubleFK");
	const $userName = sessionStorage.getItem("user");
	const $doubleFactorUrl = apiUrl + 'submit2fa/';
	const $doubleFactorData = new URLSearchParams();
	$doubleFactorData.append('code', $key.value);
	$doubleFactorData.append('user', $userName);
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
			changeUserName();
			navigateTo("/home");
		}
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}

export function generateQr()
{
	const $token = sessionStorage.getItem('pongToken');
	const $twoFactorUrl = apiUrl + 'get2fa/';
	fetch($twoFactorUrl, {
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
		const $userName = sessionStorage.getItem("user");
		const $serviceName = "Pongue";
		const $secretKey = data.context.key;

		const $otpAuthURL = 'otpauth://totp/' + encodeURIComponent($serviceName) + ':' + encodeURIComponent($userName) + 
						'?secret=' + encodeURIComponent($secretKey);
		new QRious({
			element: document.getElementById("qrCode"),
			value: $otpAuthURL
		});
	})
	.catch(error => {
		console.error('Error:', error);
	});
}