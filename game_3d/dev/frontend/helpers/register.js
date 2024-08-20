import { navigateTo } from "./navigateto.js";

export async function singPushButton() {
    const $name = document.getElementById("Name");
    const $username = document.getElementById("UserName");
    const $pass = document.getElementById("PassWord");
    const $passTwo = document.getElementById("PassWordRep");
    const $errorMessage = document.getElementById("errorMessage");
    const $elements = [$name, $username, $pass, $passTwo];

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

    if ($username.value.length > 8){
        $username.classList.add("border-danger");
        $errorMessage.textContent = "Username must be less than 9 characters long";
        return;
    }

    if ($pass.value !== $passTwo.value) {
        $pass.classList.add("border-danger");
        $passTwo.classList.add("border-danger");
        $errorMessage.textContent = "Passwords do not match";
        return;
    }

    const $singUpUrl = apiUrl + 'register/';
    const $singUpData = new URLSearchParams();
    $singUpData.append('display_name', $name.value);
    $singUpData.append('username', $username.value);
    $singUpData.append('password1', $pass.value);
    $singUpData.append('password2', $passTwo.value);

    const $registerButton = document.getElementById("singUpButton");
    if ($registerButton) {
        $registerButton.disabled = true;
        $registerButton.textContent = "Signing up...";
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
            throw new Error(`Request error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            navigateTo("/home");
        } else {
			const $dataError = data.context.errors
            handleRegistrationError($username, $pass, $dataError, $errorMessage);
        }

    } catch (error) {
        console.error('Request error:', error);
        $errorMessage.textContent = 'An error occurred. Please try again later.'
    } finally {
        if ($registerButton) {
            $registerButton.disabled = false;
            $registerButton.textContent = "Register";
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