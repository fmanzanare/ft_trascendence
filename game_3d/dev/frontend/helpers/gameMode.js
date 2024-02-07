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
	const $divSelect = document.getElementById("blackDiv");
	$divSelect.classList.add('d-none');
	const $instructionsOne = document.getElementById("instructions");
	$instructionsOne.classList.add('d-none');
	const $instructionsTwo = document.getElementById("instructionsTwoPlayer");
	$instructionsTwo.classList.remove('d-none');

	runGame();
}