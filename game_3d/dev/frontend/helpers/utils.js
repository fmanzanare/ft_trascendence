export function loginPushButton()
{
	const $name = document.getElementById("UserName");
	const $pass = document.getElementById("PassWord");
	const $fakeClickElement = document.querySelector("[data-link][href='/home']");
	const $loginUrl = 'http://localhost:8000/api/login/';
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

		// if ($fakeClickElement) {
		// 	sessionStorage.setItem('miToken', 'hola');
		// 	$fakeClickElement.click();
		// }
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
	// if ($fakeClickElement) {
	// 	sessionStorage.setItem('miToken', 'hola');
	// 	$fakeClickElement.click();
	// }

}

export function logOut()
{
	const $fakeClickElement = document.querySelector("[data-link][href='/home']");
	sessionStorage.removeItem('miToken');
	if ($fakeClickElement) {
        $fakeClickElement.click();
    }
}

export function displayChat()
{
	const $chatButton = document.getElementById("displayChat");
	const $chat = document.getElementById("chat");
	if($chat.classList.contains('d-none'))
	{
		$chatButton.classList.add('d-none');
		$chat.classList.remove('d-none');
	}
	else
	{
		$chatButton.classList.remove('d-none');
		$chat.classList.add('d-none');
	}
}

export function playOnline()
{
	if (document.getElementById("selectMode"))
	{
		const $selectMode = document.getElementById("selectMode");
		$selectMode.classList.add('d-none');
	}
	else
	{
		const $joinTournament = document.getElementById("joinTournament");
		$joinTournament.classList.add('d-none');
	}
	const $loading = document.getElementById("loading");
	$loading.classList.remove('d-none');
}
