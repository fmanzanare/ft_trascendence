export function loginPushButton()
{
	const $name = document.getElementById("UserName");
	const $pass = document.getElementById("PassWord");
	const $fakeClickElement = document.querySelector("[data-link][href='/home']");
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
			$fakeClickElement.click();
		}
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
