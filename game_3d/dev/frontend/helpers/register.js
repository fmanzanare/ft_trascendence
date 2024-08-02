import { navigateTo } from "./navigateto.js";

export async function singPushButton() {
    // Obtener elementos del DOM
    const $name = document.getElementById("Name");
    const $username = document.getElementById("UserName");
    const $pass = document.getElementById("PassWord");
    const $passTwo = document.getElementById("PassWordRep");
    const $errorMessage = document.getElementById("errorMessage");
    const $elements = [$name, $username, $pass, $passTwo];

    // Limpiar mensajes de error y estilos antes de la validación
    $elements.forEach(element => {
        element.classList.remove("border-danger");
    });
    $errorMessage.textContent = "";

    // Validar campos obligatorios
    let hasError = false;
    $elements.forEach(element => {
        if (element.value.trim() === "") {
            element.classList.add("border-danger");
            hasError = true;
        }
    });

    if (hasError) {
        $errorMessage.textContent = "Mandatory fields";
        return; // Detener el proceso si hay campos vacíos
    }

    // Validar que las contraseñas coincidan
    if ($pass.value !== $passTwo.value) {
        $pass.classList.add("border-danger");
        $passTwo.classList.add("border-danger");
        $errorMessage.textContent = "Passwords do not match";
        return;
    }

    // Construir URL y datos para la solicitud de registro
    const $singUpUrl = apiUrl + 'register/';
    const $singUpData = new URLSearchParams();
    $singUpData.append('display_name', $name.value);
    $singUpData.append('username', $username.value);
    $singUpData.append('password1', $pass.value);
    $singUpData.append('password2', $passTwo.value);

    // Obtener el botón de registro y comprobar que existe
    const $registerButton = document.getElementById("singUpButton");
    if ($registerButton) {
        $registerButton.disabled = true; // Deshabilitar botón
        $registerButton.textContent = "Registrando..."; // Cambiar texto
    }

    try {
        const response = await fetch($singUpUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: $singUpData
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();
        console.log('Registro exitoso:', data);

        if (data.success) {
            navigateTo("/home");
        } else {
			const $dataError = data.context.errors
            handleRegistrationError($username, $pass, $dataError, $errorMessage);
        }

    } catch (error) {
        console.error('Error in the request:', error);
        $errorMessage.textContent = 'An error occurred. Please try again later.'
    } finally {
        if ($registerButton) {
            $registerButton.disabled = false;
            $registerButton.textContent = "Registrar";
        }
    }
}

function handleRegistrationError($username, $pass, $dataError, $errorMessage) {
	if (typeof $dataError === 'string') {
        try {
            $dataError = JSON.parse($dataError);
        } catch (e) {
            console.error("Error al analizar JSON:", e);
            return "Error parsing JSON.";
        }
    }
    if (typeof $dataError !== 'object' || $dataError === null) {
        console.error("La estructura de 'errors' no es válida:", $dataError);
        return "Invalid error structure.";
    }
    for (const field in $dataError) {
        if ($dataError.hasOwnProperty(field)) {
            const fieldErrors = $dataError[field];
            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                const firstError = fieldErrors[0];
                $errorMessage.textContent = firstError.message;
                if (field === "username") {
                    $username.classList.add("border-danger");
                } else if (field === "password1" || field === "password2") {
                    $pass.classList.add("border-danger");
                }
                return;
            }
        }
    }
    $errorMessage.textContent = "Unknown error occurred.";
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
		sessionStorage.clear();
		window.location.reload()
	})
	.catch(error => {
		console.error('Error en la solicitud:', error);
	});
}
