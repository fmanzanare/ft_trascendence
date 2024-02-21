from django.shortcuts import render
from django.http import JsonResponse
from http import HTTPStatus
from pongue.views import jwt_required, get_user_from_jwt
from pongue.models import PongueUser

# Create your views here.

async def look_for_another_player(user):
	"""
		Async function that looks for another user in DataBase with
		Status attribute in LGAME (looking for game).

		Parameters:
		user (PongeUser): User that is looking for a remote game.

		Returns:
		PongeUser: Another user that is looking for a remote game as well.
	"""
	users = PongueUser.objects.all()
	ret = None
	while (ret == None):
		for u in users:
			if u.status == PongueUser.Status.LGAME and u != user:
				ret = u
				break
	return ret


@jwt_required
def find_game(request):
	user = get_user_from_jwt(request)
	user.status = PongueUser.Status.LGAME
	return JsonResponse(status=HTTPStatus.OK, data={
		"debug": "hello world!"
	})
