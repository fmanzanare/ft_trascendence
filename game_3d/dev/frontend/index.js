import { router } from "./helpers/router.js";
import { navigateTo } from "./helpers/navigateto.js";
import { putOffline} from "./helpers/logOut.js";

window.apiUrl = 'https://localhost/api/';

export const sockets = {};

window.addEventListener("popstate", navigateTo(window.location.pathname));

window.onload = function() {
    const $winner = sessionStorage.getItem('winner');
    console.log("hola");
	if ($winner)
	{
        sessionStorage.removeItem('winner')
        window.history.pushState(null, null, '/');
    }
}

window.addEventListener('beforeunload', function(event) {
    putOffline();
    sessionStorage.clear();
});

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
			navigateTo(e.target.href);
        }
    });
    router();
});
