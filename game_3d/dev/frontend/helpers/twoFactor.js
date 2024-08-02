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