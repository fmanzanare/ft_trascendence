import { router } from "./helpers/router.js";
import { navigateTo } from "./helpers/navigateto.js";
import { changeState, putOnline} from "./helpers/statusUser.js";

// Global variables
export const openChatWebSockets = {};

window.apiUrl = 'https://localhost:4000/api/';

export const sockets = {};

window.addEventListener("popstate", navigateTo(window.location.pathname));

window.onload = function() {
    const $winner = sessionStorage.getItem('winner');
    const $token = sessionStorage.getItem('pongToken');
    if ($token){
        putOnline(true);
        changeState("Online");
    }
	if ($winner)
	{
        sessionStorage.removeItem('winner');
        window.history.pushState(null, null, '/');
    }
}

window.addEventListener('beforeunload', function(event) {
    putOnline(false);
    changeState("Offline");
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

function nonHtml(){
    return    this.replace(/[&<>"'`]/g, function (char){
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;',
            '`': '&#96;'
        }
    });
}