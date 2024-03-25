import { handleChatInput } from "./chat";

export function displayChat()
{
	const $chatButton = document.getElementById("displayChat");
	const $chat = document.getElementById("chat");
	if($chat.classList.contains('d-none'))
	{
		$chatButton.classList.add('d-none');
		$chat.classList.remove('d-none');
		console.log("Abre chat")
		// const $chatInput = document.querySelector("#chatInput");
		// $chatInput.focus();
		// $chatInput.onkeyup = function(e) {
		// 	if (e.key === 'Enter') {
		// 		console.log($chatInput.value)
		// 	}
		// };
		handleChatInput();
	}
	else
	{
		$chatButton.classList.remove('d-none');
		$chat.classList.add('d-none');
	}
}

export function changeViewProfile()
{
	const $infoProfile = document.getElementById('infoProfile');
	const $historyProfile = document.getElementById('historyProfile');
	const $infoTab = document.getElementById('infoTab');
	const $historyTab = document.getElementById('historyTab');
	if ($infoProfile.classList.contains('show', 'active'))
	{
		$infoProfile.classList.remove('show', 'active');
		$historyProfile.classList.add('show', 'active');
		$historyProfile.classList.remove('d-none');
		$infoTab.classList.remove('active');
		$historyTab.classList.add('active');
	}
	else
	{
		$infoProfile.classList.add('show', 'active');
		$historyProfile.classList.remove('show', 'active');
		$historyProfile.classList.add('d-none');
		$infoTab.classList.add('active');
		$historyTab.classList.remove('active');
	}
}

export function changeViewData()
{
	const $dataUserShow = document.getElementById('dataUserShow');
	const $dataUserChange = document.getElementById('dataUserChange');
	$dataUserShow.classList.add('d-none');
	$dataUserChange.classList.remove('d-none');
}