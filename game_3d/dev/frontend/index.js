import { router } from "./helpers/router.js";
import { navigateTo } from "./helpers/navigateto.js";

// Global variables
window.openChatWebSockets = new Map();

window.apiUrl = 'http://localhost:8000/api/';

window.addEventListener("popstate", navigateTo("/home"));

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            document.querySelectorAll("[data-link].active").forEach(el => {
                el.classList.remove("active");
            });
            e.target.classList.add("active");
			navigateTo(e.target.href);
        }
    });
    router();
});
