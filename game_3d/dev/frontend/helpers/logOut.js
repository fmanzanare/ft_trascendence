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
		window.history.pushState(null, null, '/');
		window.location.reload();
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}