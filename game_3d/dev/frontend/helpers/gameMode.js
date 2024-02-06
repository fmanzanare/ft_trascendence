import { runGame } from "../../game3D/src/scripts";

export function playOnline()
{
	if (document.getElementById("selectMode"))
	{
		const $selectMode = document.getElementById("selectMode");
		$selectMode.classList.add('d-none');
	}
	else
	{
		const $joinTournament = document.getElementById("joinTournament");
		$joinTournament.classList.add('d-none');
	}
	const $loading = document.getElementById("loading");
	$loading.classList.remove('d-none');
}

export function playLocal()
{
	runGame();
}