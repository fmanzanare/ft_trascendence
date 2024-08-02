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
		sessionStorage.clear();
		window.location.reload()
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