import Home from "../views/Home.js";
import Tournaments from "../views/Tournaments.js";
import Ranking from "../views/Ranking.js";
import Login from "../views/LogIn.js";
import Signup from "../views/SignUp.js";
import Profile from "../views/Profile.js";
import {routerFunctions} from "./routerClick.js";

function pathToRegex(path) {
	return new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");
}

function getParams(match) {
	const values = match.result.slice(1);
	const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

	return Object.fromEntries(keys.map((key, i) => {
		return [key, values[i]];
	}));
}

export async function router() {
	const $routes = [
		{ path: "/home", view: Home },
		{ path: "/login", view: Login },
		{ path: "/signup", view: Signup },
		{ path: "/tournaments", view: Tournaments },
		{ path: "/ranking", view: Ranking },
		{ path: "/profile", view: Profile }
	];

	const $potentialMatches = $routes.map(route => {
		return {
			route: route,
			result: location.pathname.match(pathToRegex(route.path))
		};
	});

	let match = $potentialMatches.find(potentialMatch => potentialMatch.result !== null);

	if (!match) {
		match = {
			route: routes[0],
			result: [location.pathname]
		};
	}

	const $view = new match.route.view(getParams(match));

	document.querySelector("#app").innerHTML = await $view.getHtml();

	routerFunctions();
}
