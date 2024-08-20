import {twoFactorChecked, twoFactorUnchecked, conectServerChange, getBase64Image} from "./changeDataUserUtils.js"

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
			throw new Error('Unexpected error.');
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

export function changeDataUser()
{
	const $picture = document.getElementById("profilePictureChange").files[0];
	let twoFactorControl;
	let twoFactorCheck;
	if (document.getElementById("checkChecked"))
	{
		twoFactorCheck = document.getElementById("checkChecked");
		twoFactorControl = true;
	}
	else
	{
		twoFactorCheck = document.getElementById("checkUnchecked");
		twoFactorControl = false;
	}
	if (twoFactorCheck.checked && !twoFactorControl)
		twoFactorChecked();
	else if (!twoFactorCheck.checked && twoFactorControl)
		twoFactorUnchecked();
	else
	{
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
}