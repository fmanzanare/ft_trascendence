import { router } from "./helpers/router.js";
import { navigateTo } from "./helpers/navigateto.js";

window.apiUrl = 'https://localhost:4000/api/';

export const sockets = {};

window.addEventListener("popstate", navigateTo(window.location.pathname));

window.onload = function() {
    const $winner = sessionStorage.getItem('winner');
	if ($winner)
	{
        sessionStorage.removeItem('winner')
        window.history.pushState(null, null, '/');
    }

}

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
			navigateTo(e.target.href);
        }
    });
    router();
});
