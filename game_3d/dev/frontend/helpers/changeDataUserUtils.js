import { navigateTo } from "./navigateto.js";
import { changeUserName } from "./utils.js";

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

export function twoFactorChecked()
{
	const $token = sessionStorage.getItem('pongToken');
	const $twoFactorUrl = apiUrl + 'enable2fa/';
	fetch($twoFactorUrl, {
		method: 'POST',
		headers: {
			"Authorization": $token
		},
	})
	.then(response => {
		if (!response.ok)
			throw new Error(`Error en la solicitud: ${response.status}`);
		else
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
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}

export function twoFactorUnchecked()
{
	const $token = sessionStorage.getItem('pongToken');
	const $twoFactorUrl = apiUrl + 'disable2fa/';
	fetch($twoFactorUrl, {
		method: 'POST',
		headers: {
			"Authorization": $token
		},
	})
	.then(response => {
		if (!response.ok)
			throw new Error(`Error en la solicitud: ${response.status}`);
		else
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
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}