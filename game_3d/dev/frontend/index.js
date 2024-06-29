import { router } from "./helpers/router.js";
import { navigateTo } from "./helpers/navigateto.js";

window.apiUrl = 'https://localhost/api/';

export const sockets = {};

window.addEventListener("popstate", navigateTo("/home"));

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
			navigateTo(e.target.href);
        }
    });
    router();
});
