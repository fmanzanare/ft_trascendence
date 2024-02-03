import { router } from "./helpers/router.js";
import { navigateTo } from "./helpers/navigateto.js";
import { runGame } from "../game3D/src/scripts.js";

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
