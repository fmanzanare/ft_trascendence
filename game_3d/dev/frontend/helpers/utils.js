export function displayChat()
{
	const $chatButton = document.getElementById("displayChat");
	const $chat = document.getElementById("chat");
	if($chat.classList.contains('d-none'))
	{
		$chatButton.classList.add('d-none');
		$chat.classList.remove('d-none');
	}
	else
	{
		$chatButton.classList.remove('d-none');
		$chat.classList.add('d-none');
	}
}
