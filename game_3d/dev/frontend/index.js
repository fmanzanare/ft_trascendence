import { router } from "./helpers/router.js";
import { navigateTo } from "./helpers/navigateto.js";
import { changeState, putOnline} from "./helpers/statusUser.js";
import { getFriends } from "./helpers/changeView.js";
import { ChatSocketsManager } from "./classes/ChatSocketsManager.js";

// Global variables
const DEBUG = false;
if (DEBUG) {
    console.log = () => {}
}

export var openChatWebSockets = {};
export var friendshipSocket = {};

window.apiUrl = 'https://localhost:4000/api/';

export const sockets = {};

window.addEventListener("popstate", navigateTo(window.location.pathname));

window.onload = function() {
    const $winner = sessionStorage.getItem('winner');
    const $token = sessionStorage.getItem('pongToken');
    if ($token){
        putOnline(true);
        changeState("Online");
        new ChatSocketsManager();
    }
	if ($winner)
	{
        sessionStorage.removeItem('winner');
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