import json
from functools import wraps
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm
from .forms import CreateUserForm
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime, timezone
import requests
import os
from django.db.models import Q
from .models import GameResults, PongueUser, PlayerFriend, RankingUserDTO, UserHistoryDTO, UserProfile
from chat.models import ChatMessage
from .otp import totp
import base64, hashlib
from django.http import JsonResponse
from http import HTTPStatus
from .jwt import generate_jwt, decode_jwt
from datetime import datetime
from django.core import serializers
import json

def get_user_from_jwt(request):
	jwt = request.headers.get("Authorization")
	if jwt:
		payload = decode_jwt(jwt)
		if ("error" in payload.keys()):
			return None
		user = json.loads(payload['user'])[0]['fields']
		if user and payload['exp'] > datetime.timestamp(datetime.utcnow()):
			try:
				user_django = PongueUser.objects.get(username=user['username'])
			except PongueUser.DoesNotExist:
				return None
			if user_django:
				response = user_django
			else:
				response = None
			return response

		else:
			return None
	else:
		return None

def jwt_required(function):
	@wraps(function)
	def wrap(request, *args, **kwargs):
		user = get_user_from_jwt(request)
		if user:
			return function(request, *args, **kwargs)
		else:
			return JsonResponse({
				"success": False,
				"message": "Invalid JWT",
				"redirect": True,
				"redirect_url": "login",
				"context": {},
				})
	return wrap

@jwt_required
def index(request):
	hashed_secret = hashlib.sha512((get_user_from_jwt(request).username + os.environ.get("OTP_SECRET")).encode("utf-8")).digest()
	encoded_secret = base64.b32encode(hashed_secret).decode("utf-8")
	# WAS: return render(request, "index.html", {"key": encoded_secret})
	return JsonResponse({
		"success": True,
		"message": "",
		"redirect": False,
		"redirect_url": "",
		"context": {
			"key": encoded_secret
		},
		"logged_in": request.user.is_authenticated,
	})

# /register
# GET: Returns the register form HTML
# POST: Creates a new user if the form is valid, otherwise returns the errors
# Parameters: "display_name", "username", "password1", "password2"
# Format: application/x-www-form-urlencoded
@csrf_exempt
def register(request):
    if get_user_from_jwt(request):
        return JsonResponse({
            "success": True,
            "message": "User already logged in",
            "redirect": True,
            "redirect_url": "index",
            "context": {},
        })

    if request.method == "POST":
        form = CreateUserForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Account created successfully!")
            return JsonResponse({
                "success": True,
                "message": "Account created successfully!",
                "redirect": True,
                "redirect_url": "login",
                "context": {},
            })
        else:
            return JsonResponse({
                "success": False,
                "message": "Invalid form",
                "redirect": True,
                "redirect_url": "register",
                "context": {"errors": form.errors.as_json()},
            })

    form = CreateUserForm()
    form_html = '<form method="POST" action="" class="row row-cols-1">' \
                '<div class="col">Display name <input type="text" name="display_name" maxlength="50" required id="id_display_name"></div>' \
                '<div class="col">Username <input type="text" name="username" maxlength="50" autofocus required id="id_username"></div>' \
                '<div class="col">Password <input type="password" name="password1" autocomplete="new-password" required id="id_password1"></div>' \
                '<div class="col">Password confirmation <input type="password" name="password2" autocomplete="new-password" required id="id_password2"></div>' \
                '<button type="submit" class="col btn btn-primary">Submit</button></form>'

    return JsonResponse({
        "success": True,
        "message": "",
        "redirect": False,
        "redirect_url": "",
        "context": {"form": form_html},
        "logged_in": request.user.is_authenticated,
    })

# /login
# POST: Logs in the user
# Parameters: "username", "password"
# Format: application/x-www-form-urlencoded
def login(request):
	message = "User not logged in"
	if get_user_from_jwt(request):
		# WAS: return redirect("index")
		message = "User already logged in"
		return JsonResponse({
			"success": False,
			"message": message,
			"redirect": False,
			"redirect_url": "",
			"context": {},
		})
	if request.method == "POST":
		username = request.POST.get("username")
		password = request.POST.get("password")
		user = authenticate(request, username=username, password=password)
		pongueUser: PongueUser = PongueUser.objects.get(username=username)

		if pongueUser is not None and pongueUser.status == PongueUser.Status.ONLINE:
			message = "User already logged in"
		elif user is not None:
			return pass2fa(request, user)
		else:
			# WAS: messages.info(request, "Username or password is incorrect")
			message = "Username or password is incorrect"
	# WAS: return render(request, "login.html")
	return JsonResponse(status=HTTPStatus.BAD_REQUEST, data={
		"success": False,
		"message": message,
		"redirect": False,
		"redirect_url": "",
		"context": {},
		"logged_in": request.user.is_authenticated,
	})

# /pass2fa (internal)
# GET: Checks if the user has 2FA enabled, if so, tells to redirect to the 2FA page, otherwise logs in the user
def pass2fa(request, user_obj):
	if user_obj.has_2fa:
		hashed_secret = hashlib.sha512((user_obj.username + os.environ.get("OTP_SECRET")).encode("utf-8")).digest()
		encoded_secret = base64.b32encode(hashed_secret)
		# WAS: return render(request, "pass2fa.html", {"user": user_obj.username,"key": encoded_secret})
		return JsonResponse({
			"success": True,
			"message": "Has to pass 2FA",
			"redirect": True,
			"redirect_url": "pass2fa",
			"context": {
				"user": user_obj.username,
			},
		})
	else:
		user_obj.status = PongueUser.Status.ONLINE
		user_obj.save()
		# WAS: return redirect("index")
		return JsonResponse({
			"success": True,
			"message": "Login completed",
			"userId": user_obj.id,
			"redirect": True,
			"redirect_url": "home",
			"context": {
				"jwt": generate_jwt(user_obj),
				"userId": user_obj.id
			},
		})

# /submit2fa
# POST: Checks if the 2FA code is valid, if so, logs in the user, otherwise returns an error
# Parameters: "user", "code"
# Format: application/x-www-form-urlencoded
def submit2fa(request):
	if request.method == "POST":
		user = PongueUser.objects.get(username=request.POST.get("user"))
		hashed_secret = hashlib.sha512((user.username + os.environ.get("OTP_SECRET")).encode("utf-8")).digest()
		encoded_secret = base64.b32encode(hashed_secret)
		if totp(encoded_secret) == request.POST.get("code"):
			# auth_login(request, user)
			user.status = PongueUser.Status.ONLINE
			# user.status = "online"
			user.save()
			# WAS: return redirect("index")
			return JsonResponse({
				"success": True,
				"message": "2FA passed successfully",
				"redirect": True,
				"userId": user.id,
				"redirect_url": "index",
				"context": {
					"jwt": generate_jwt(user)
				},
				})
		else:
			# WAS:
			# messages.info(request, "Invalid OTP")
			# return redirect("login")
			return JsonResponse({
				"success": False,
				"message": "Invalid OTP",
				"redirect": True,
				"redirect_url": "login",
				"context": {}
			})
	else:
		# WAS:
		# messages.info(request, "Invalid method")
		# return redirect("login")
		return JsonResponse({
			"success": False,
			"message": "Invalid method",
			"redirect": True,
			"redirect_url": "login",
			"context": {}
		})

# /check_jwt
# Checks if the JWT is valid
@login_required(login_url="login")
def check_jwt(request):
	jwt = request.headers.get("Authorization")
	if jwt:
		user = get_user_from_jwt(request)
		if user:
			return JsonResponse({
				"success": True,
				"message": "JWT OK",
				"redirect": False,
				"redirect_url": "",
				"context": {
					"user": json.loads(serializers.serialize("json", [user]))[0]["fields"],
				},
				})
		else:
			return JsonResponse({
				"success": False,
				"message": "JWT Invalid",
				"redirect": True,
				"redirect_url": "login",
				"context": {},
				})
	else:
		return JsonResponse({
			"success": False,
			"message": "JWT not found",
			"redirect": True,
			"redirect_url": "login",
			"context": {},
		})

# /disable2fa
# GET: Disables 2FA for the logged-in user
@jwt_required
def disable2fa(request):
	user = PongueUser.objects.get(username=get_user_from_jwt(request))
	user.has_2fa = False
	user.save()
	# WAS: return redirect("index")
	return JsonResponse({
		"success": True,
		"message": "2FA disabled successfully",
		"redirect": True,
		"redirect_url": "index",
		"context": {},
		"logged_in": request.user.is_authenticated,
	})

# /enable2fa
# GET: Enables 2FA for the logged-in user
@jwt_required
def enable2fa(request):
	user = PongueUser.objects.get(username=get_user_from_jwt(request))
	user.has_2fa = True
	user.save()
	# WAS: return redirect("index")
	return JsonResponse({
		"success": True,
		"message": "2FA enabled successfully",
		"redirect": True,
		"redirect_url": "index",
		"context": {},
		"logged_in": request.user.is_authenticated,
	})

# /get2fa
# GET: Returns the 2FA key for the logged-in user
@jwt_required
def get2fa(request):
	user = PongueUser.objects.get(username=get_user_from_jwt(request))
	hashed_secret = hashlib.sha512((user.username + os.environ.get("OTP_SECRET")).encode("utf-8")).digest()
	encoded_secret = base64.b32encode(hashed_secret).decode("utf-8")
	# WAS: return render(request, "get2fa.html", {"key": encoded_secret})
	return JsonResponse({
		"success": True,
		"message": "",
		"redirect": False,
		"redirect_url": "",
		"context": {
			"key": encoded_secret
		},
		"logged_in": request.user.is_authenticated,
	})

# /logout
# GET: Logs out the logged-in user
@jwt_required
def logout(request):
	user = PongueUser.objects.get(username=get_user_from_jwt(request))
	user.status = PongueUser.Status.OFFLINE
	user.save()
	return JsonResponse({
		"success": True,
		"message": "Logged out successfully",
		"redirect": True,
		"redirect_url": "login",
		"context": {},
		"logged_in": request.user.is_authenticated,
	})

# /auth
# GET: Logs in the user using the 42 API
def auth(request):
	if get_user_from_jwt(request):
		# WAS: return redirect("index")
		return JsonResponse({
			"success": True,
			"message": "User already logged in",
			"redirect": True,
			"redirect_url": "index",
			"context": {},
		})
	if request.method == "GET":
		code = request.GET.get("code")
		if code:
			data = {
				"grant_type": "authorization_code",
				"client_id": os.environ.get("FT_CLIENT_ID"),
				"client_secret": os.environ.get("FT_CLIENT_SECRET"),
				"code": code,
				"redirect_uri": "https://localhost:4000/api",
			}
			auth_response = requests.post("https://api.intra.42.fr/oauth/token", data=data)
			try:
				access_token = auth_response.json()["access_token"]
			except:
				return JsonResponse({
					"success": False,
					"message": "Invalid method",
					"redirect": True,
					"redirect_url": "login",
					"context": {}
				})

			user_response = requests.get("https://api.intra.42.fr/v2/me", headers={"Authorization": f"Bearer {access_token}"})
			username = user_response.json()["login"] + "#42"
			display_name = user_response.json()["displayname"]

			try:
				user: PongueUser = PongueUser.objects.get(username=username)
				if user is not None and user.status == PongueUser.Status.ONLINE:
					return JsonResponse({
						"success": False,
						"message": "User already logged in",
						"redirect": True,
						"redirect_url": "login",
						"context": {}
					})
				elif (user.from_42):
					return pass2fa(request, user)
				else:
					# WAS:
					# messages.info(request, "User already exists")
					# return redirect("login")
					return JsonResponse({
						"success": False,
						"message": "User already exists",
						"redirect": True,
						"redirect_url": "login",
						"context": {}
					})
			except PongueUser.DoesNotExist:
				user = PongueUser.objects.create_user(username=username, display_name=display_name, from_42=True)
				# auth_login(request, user)
				user.status = PongueUser.Status.ONLINE
				user.save()
				# WAS: return redirect("index")
				return JsonResponse({
					"success": True,
					"message": "Login completed",
					"userId": user.id,
					"redirect": True,
					"redirect_url": "index",
					"context": {
						"jwt": generate_jwt(user)
					},
						})
		else:
			# WAS:
			# messages.info(request, "Invalid authorization code")
			# return redirect("login")
			return JsonResponse({
				"success": False,
				"message": "Invalid authorization code",
				"redirect": True,
				"redirect_url": "login",
				"context": {}
			})
	else:
		# WAS:
		# messages.info(request, "Invalid method")
		# return redirect("login")
		return JsonResponse({
			"success": False,
			"message": "Invalid method",
			"redirect": True,
			"redirect_url": "login",
			"context": {}
		})

# /friends
# GET: Returns the friends list of the logged-in user
# POST: Adds or removes a friend from the logged-in user
# Parameters: "username", "action"
# Format: application/x-www-form-urlencoded
@jwt_required
def friends(request):
	if request.method == "POST":
		try:
			body = json.loads(request.body)
			username = body.get("username")
			action = body.get("action")

			if not username or not action:
				return JsonResponse({"success": False, "message": "Missing username or action"}, status=400)

			user = PongueUser.objects.filter(username=get_user_from_jwt(request)).first()
			friend = PongueUser.objects.filter(username=username).first()

			if not user or not friend:
				return JsonResponse({"success": False, "message": "User or friend not found"}, status=404)

			if action == "block":
				friendship = (PlayerFriend.objects.filter(myUser=user, myFriend=friend) |
							PlayerFriend.objects.filter(myUser=friend, myFriend=user)).first()
				if not friendship:
					return JsonResponse({
						"success": False,
						"message": "Friendship not found"
						}, status=404)
				else:
					friendship.blockFriend()
			elif action == "add":
				PlayerFriend.searchOrCreate(get_user_from_jwt(request), username)
			elif action == "remove":
				user.friends.remove(friend)
			elif action in ["accept", "reject"]:
				friendship = (PlayerFriend.objects.filter(myUser=user, myFriend=friend) |
							PlayerFriend.objects.filter(myUser=friend, myFriend=user)).first()
				if not friendship:
					return JsonResponse({
						"success": False,
						"message": "Friendship not found"
						}, status=404)
				if action == "reject":
					friendship.delete()
				else:
					friendship.status = PlayerFriend.Status.ACCEPTED if action == "accept" else PlayerFriend.Status.REJECTED
					friendship.save()

			else:
				return JsonResponse({
					"success": False,
					"message": "Invalid action"
				}, status=400)

			user.save()
			return JsonResponse({
				"success": True,
				"message": "Action completed successfully",
				"redirect": False,
				"redirect_url": "",
				"context": {}
			})

		except json.JSONDecodeError:
			return JsonResponse({
				"success": False,
				"message": "Invalid JSON",
			}, status=400)
		except Exception as e:
			return JsonResponse({
				"success": False,
				"message": "An unexpected error occurred"
			}, status=404)
	elif request.method == "GET":
		try:
			current_user = get_user_from_jwt(request)
			friendships = PlayerFriend.objects.filter(
				Q(myUser__username=current_user.username, status__in=[PlayerFriend.Status.PENDING, PlayerFriend.Status.ACCEPTED, PlayerFriend.Status.REJECTED, PlayerFriend.Status.BLOCKED]) |
				Q(myFriend__username=current_user.username, status__in=[PlayerFriend.Status.PENDING, PlayerFriend.Status.ACCEPTED, PlayerFriend.Status.REJECTED, PlayerFriend.Status.BLOCKED])
			).distinct()
			friends_list = [
				{
					"username": friendship.myFriend.username if friendship.myUser == current_user else friendship.myUser.username,
					"friendUsername": friendship.myFriend.username,
					"friendUserId": friendship.myFriend.id,
					"friendshipId": friendship.id,
					"status": friendship.status
				} for friendship in friendships
			]
			return JsonResponse({
				"success": True,
				"message": "Friends list fetched successfully.",
				"redirect": False,
				"redirect_url": "",
				"context": {"friends": friends_list},
			})
		except Exception as e:
			return JsonResponse({
				"success": False,
				"message": f"An error occurred: {str(e)}",
				"redirect": False,
				"redirect_url": "",
				"context": {}
			})
	else:
		return JsonResponse({
			"success": False,
			"message": "Invalid method",
			"redirect": True,
			"redirect_url": "login",
			"context": {}
		})

# /profile
# GET: Returns the profile object
# POST: Updates the profile object
@jwt_required
def profile(request):
	if request.method == "GET":
		user = get_user_from_jwt(request)
		jsonUser = serializers.serialize("json", [PongueUser.objects.get(username=get_user_from_jwt(request))])
		return JsonResponse({
			"success": True,
			"message": "",
			"redirect": False,
			"redirect_url": "",
			"context": {
				"user": json.loads(jsonUser)[0]["fields"],
				"points": user.points
			},
		})
	elif request.method == "POST":
		user = PongueUser.objects.get(username=get_user_from_jwt(request))
		if (request.POST.get("display_name") != ""):
			user.display_name = request.POST.get("display_name")
		if (request.POST.get("avatar_base64") != ""):
			user.avatar_base64 = request.POST.get("avatar_base64")
		user.save()
		return JsonResponse({
			"success": True,
			"message": "Profile updated successfully",
			"redirect": False,
			"redirect_url": "",
			"context": {},
		})
#Profile other user
@jwt_required
def profile_id(request):
	user = None
	user_id = request.GET.get("userId")
	try:
		if user_id:
			user = PongueUser.objects.get(id=user_id)
		else:
			return JsonResponse({"success": False, "error": "userId is required"}, status=400)
	except ObjectDoesNotExist:
		return JsonResponse({"success": False, "error": "User not found"}, status=404)
	userProfile = UserProfile.toUseUserProfile(user)
	gameResults: list[GameResults] = GameResults.objects.filter(player_1=user).values() | GameResults.objects.filter(player_2=user).values()
	historyDtos = []
	for gameResult in gameResults:
		historyDto: UserHistoryDTO = UserHistoryDTO.toUserHistoryDTO(user, gameResult)
		historyDtos.append({
			"id": historyDto.id,
			"idRival": historyDto.idRival,
			"rival": historyDto.rival,
			"isWin": historyDto.isWin,
			"date": historyDto.date,
			"myScore": historyDto.myScore,
			"myRivalScore": historyDto.myRivalScore
		})
	if len(historyDtos) > 0:
		total_myScore = sum(item['myScore'] for item in historyDtos)
		total_rivalScore = sum(item['myRivalScore'] for item in historyDtos)
		rival_count = {}

		for item in historyDtos:
			rival = item['rival']
			if rival in rival_count:
				rival_count[rival] += 1
			else:
				rival_count[rival] = 1
	
		wins_count = {}
		for item in historyDtos:
			rival = item['rival']
			if item['isWin']:
				if rival in wins_count:
					wins_count[rival] += 1
				else:
					wins_count[rival] = 1

		losses_count = {}
		for item in historyDtos:
			rival = item['rival']
			if not item['isWin']:
				if rival in losses_count:
					losses_count[rival] += 1
				else:
					losses_count[rival] = 1

		last_game = max(historyDtos, key=lambda x: x['date'])
		current_date = datetime.now(timezone.utc)
		if last_game['date'].date() == current_date.date():
			formatted_date = last_game['date'].strftime('%H:%M')
		else:
			formatted_date = last_game['date'].strftime('%d/%m/%Y')

		most_losses_rival = max(losses_count, key=losses_count.get, default="You have no defeats")
		most_wins_rival = max(wins_count, key=wins_count.get, default="You have no victories")
		most_played_rival = max(rival_count, key=rival_count.get)
	else:
		total_myScore = 0
		total_rivalScore = 0
		most_played_rival = "No opponents played"
		most_wins_rival = "No victories"
		most_losses_rival = "No defeats"
		formatted_date = "No games played"
	return JsonResponse({
        "success": True,
        "context": {
            "user": {
                "display_name": userProfile.nick,
                "puntos": userProfile.points,
                "avatar_base64": userProfile.avatar,
                "status": userProfile.status,
                "games_played": userProfile.games,
                "games_won": userProfile.wins,
				"my_total_score": total_myScore,
				"rival_score": total_rivalScore,
				"favorite_opponent": most_played_rival,
				"most_won_opponent": most_wins_rival,
				"most_loss_opponent": most_losses_rival,
				"last_day_date": formatted_date,
                "tournaments": userProfile.tournaments,
                "tournaments_won": userProfile.tournamentsWin
            }
        }
    })

@jwt_required
def get_user_id(request):
	user_name = request.GET.get("userName")
	user = PongueUser.objects.get(username=user_name)
	return JsonResponse(status=HTTPStatus.OK, data={
		"userId": user.id
	})
	
@jwt_required
def user_status(request):
	user = get_user_from_jwt(request)
	return JsonResponse(status=HTTPStatus.OK, data={
		"userId": user.id,
		"userStatus": user.status
	})

@jwt_required
def ranking(request):
	users = PongueUser.objects.all().order_by("-points")
	userDtos = []
	for user in users:
		userDto: RankingUserDTO = RankingUserDTO.toRankingUserDTO(user)
		userDtos.append({
			"id": userDto.id,
			"username": userDto.username,
			"games_won": userDto.games_won,
			"games_lost": userDto.games_lost,
			"games_played": userDto.games_played,
			"tournaments": userDto.tournaments,
			"points": userDto.points
		})
	return JsonResponse(status=HTTPStatus.OK, data={
		"users": userDtos
	})

def check_available_nickname(nickname, target: PongueUser):
	flag = True
	users: list[PongueUser] = PongueUser.objects.all()
	for user in users:
		if (target.id == user.id):
			continue
		elif (nickname == user.nickname):
			flag = False
			break
	
	return flag


@jwt_required
def nickname(request):
	user: PongueUser = get_user_from_jwt(request)
	if request.method == "GET":
		return JsonResponse({
			"userId": user.id,
			"nickname": user.nickname
		})
	elif request.method == "POST":
		if (request.POST.get("nickname") != ""):
			nickname = request.POST.get("nickname")
			if (not check_available_nickname(nickname=nickname, target=user)):
				return JsonResponse(status=HTTPStatus.CONFLICT, data={
					"success": False,
					"error": "Nickname is already in use"
				})
			else:
				user.nickname = nickname
				user.save()
				return JsonResponse({
					"userId": user.id,
					"nickname": user.nickname
				})
		else:
			return JsonResponse(status=HTTPStatus.CONFLICT, data={
				"success": False,
				"error": "Nickname field must be filled"
			})

@jwt_required
def change_status_to_online(request):
	user = get_user_from_jwt(request)
	user.status = PongueUser.Status.ONLINE
	user.save()
	return JsonResponse({
		"userId": user.id,
		"status": user.status
	})

@jwt_required
def change_status_to_offline(request):
	user = get_user_from_jwt(request)
	user.status = PongueUser.Status.OFFLINE
	user.save()
	return JsonResponse({
		"userId": user.id,
		"status": user.status
	})

@jwt_required
def user_history(request):
	user_id = request.GET.get("userId")
	user = PongueUser.objects.get(id=user_id)
	gameResults: list[GameResults] = GameResults.objects.filter(player_1=user).values() | GameResults.objects.filter(player_2=user).values()
	historyDtos = []
	for gameResult in gameResults:
		historyDto: UserHistoryDTO = UserHistoryDTO.toUserHistoryDTO(user, gameResult)
		historyDtos.append({
			"id": historyDto.id,
			"idRival": historyDto.idRival,
			"rival": historyDto.rival,
			"isWin": historyDto.isWin,
			"myScore": historyDto.myScore,
			"myRivalScore": historyDto.myRivalScore
		})
	return JsonResponse(status=HTTPStatus.OK, data={
		"history": historyDtos
	})


# Retrieves the chat messages for a user.
# Parameters:
# - request: The HTTP request object.
# Returns:
# - A JSON response containing the chat messages for the user.
@jwt_required
def chatMessages(request, *args, **kwargs):
	messages : list[ChatMessage] = ChatMessage.getMessages(kwargs["chatId"])
	messagesDto = []
	for message in messages:
		messagesDto.append({
			"chatId": message.chat.id,
			"senderId": message.senderId.id,
			"isRead": message.isRead,
			"message": message.message
		})
	return JsonResponse({
		"success": True,
		"messages": messagesDto
	})