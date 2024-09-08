import { getFriends } from "./changeView.js";
import { navigateTo } from "./navigateto.js";
import { openStatusSocket } from "./socketsMng.js";
import { changeUserName } from "./utils.js";

export async function loginPushButton() {
    const $name = document.getElementById("UserName");
    const $pass = document.getElementById("PassWord");
    const $errorMessage = document.getElementById("errorMessage");
    const $loginUrl = apiUrl + 'login/';
    const $elements = [$name, $pass];
    const $loginData = new URLSearchParams();
    $loginData.append('username', $name.value);
    $loginData.append('password', $pass.value);
    $elements.forEach(element => {
        element.classList.remove("border-danger");
    });
    $errorMessage.textContent = "";

    let hasError = false;
    $elements.forEach(element => {
        if (element.value.trim() === "") {
            element.classList.add("border-danger");
            hasError = true;
        }
    });

    if (hasError) {
        $errorMessage.textContent = "Mandatory fields";
        return;
    }
    
    const $loginButton = document.getElementById("loginButton");
    $loginButton.disabled = true;
    $loginButton.textContent = "Login in...";

    try {
        const response = await fetch($loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: $loginData
        });
        if (!response.ok) {
            if (response.status === 400) {
                const errorData = await response.json();
                if (errorData.message === "Username or password is incorrect") {
                    $elements.forEach(element => {
                        element.classList.add("border-danger");
                    });
                    $errorMessage.textContent = "Username or password is incorrect";
                } else {
                    $errorMessage.textContent = errorData.message || "Unkown error.";
                }
            } else {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            return;
        }
        const data = await response.json();
        if (data.success) {
            sessionStorage.setItem('user', $name.value);
            sessionStorage.setItem('userId', data.userId);

            if (data.redirect_url === "pass2fa") {
                navigateTo("/twofactor");
            } else {
                sessionStorage.setItem('pongToken', data.context.jwt);
                changeUserName();
                getFriends();
                navigateTo("/home");
                openStatusSocket();
            }
        } else {
            $elements.forEach(element => {
                element.classList.add("border-danger");
            });
            $errorMessage.textContent = data.message || "Username or password is incorrect";
        }

    } catch (error) {
        console.error('Error en la solicitud:', error);
        $errorMessage.textContent = 'Unexpected error. Please try again.';
    } finally {
        $loginButton.disabled = false;
        $loginButton.textContent = "Log in";
    }
}

export function twoFactorPushButton()
{
	const $key = document.getElementById("doubleFK");
	const $userName = sessionStorage.getItem("user");
    const $errorMessage = document.getElementById("errorMessage")
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
			throw new Error(`Request error: ${response.status}`);
		}
		return response.json()
	})
	.then(data => {
        console.log(data)
		if (data.success) {
			sessionStorage.setItem('pongToken', data.context.jwt);
			sessionStorage.setItem('userId', data.userId);
            getFriends();
			navigateTo("/home");
            openStatusSocket();
		}
        else {
            $key.classList.add("border-danger");
            $errorMessage.textContent = 'Wrong code';
        }
	})
	.catch(error => {
		console.error('Request error:', error);
	});
}

export function login42(code){
    const $login42URL = `${apiUrl}auth/?code=${encodeURIComponent(code)}`
    fetch($login42URL, {
        method: 'GET',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        if(data.success) {
            navigateTo("/api");
            if (data.redirect_url === "pass2fa"){
                sessionStorage.setItem('user', data.context.user);
                navigateTo("/twofactor");
            } else {
                console.log('Login successful');
                sessionStorage.setItem('pongToken', data.context.jwt);
                sessionStorage.setItem('userId', data.userId);
			    changeUserName();
                getFriends();
                navigateTo("/home")
                openStatusSocket();
            }
        } else {
            const $modal = document.getElementById("myAlert");
            const $textModalMessage = document.getElementById("textAlert");
            // $textModalMessage.textContent = "42 API connection error";
            $textModalMessage.textContent = data.message;
            $modal.classList.add("show");
            $modal.style.display = "block";
            $modal.setAttribute("aria-modal", "accept");
            $modal.setAttribute("role", "dialog");
        }
    })
    .catch(error => console.error('Error:', error));
}