import { navigateTo } from "./navigateto";
import { changeState } from "./utils";

export function cancelNav()
{
	const $modal = document.getElementById('myModal');
	sessionStorage.removeItem('urlAlert');
    $modal.classList.remove('show');
    $modal.style.display = 'none';
}

export function acceptNav()
{
	const $modal = document.getElementById('myModal');
	const $url = sessionStorage.getItem('urlAlert')
	sessionStorage.removeItem('urlAlert');
    $modal.classList.remove('show');
    $modal.style.display = 'none';
	changeState("Online");
	navigateTo($url);
}