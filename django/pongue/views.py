import json
from functools import wraps
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm
from .forms import CreateUserForm
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
import requests
import os
from .models import GameResults, PongueUser ,PlayerFriend
from .otp import totp
import base64, hashlib
from django.http import JsonResponse
from .jwt import generate_jwt, decode_jwt
from datetime import datetime
from django.core import serializers
import json

def get_user_from_jwt(request):
	jwt = request.headers.get("Authorization")
	if jwt:
		payload = decode_jwt(jwt)
		if not 'user' in payload:
			return None
		user = json.loads(payload['user'])[0]['fields']
		if user and payload['exp'] > datetime.timestamp(datetime.utcnow()):
			user_django = PongueUser.objects.get(username=user['username'])
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

# /
# For the moment, only returns the 2FA key mientras no encontramos un mejor lugar para ponerlo
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
def register(request):
	if get_user_from_jwt(request):
		# WAS: return redirect("index")
		return JsonResponse({
			"success": True,
			"message": "User already logged in",
			"redirect": True,
			"redirect_url": "index",
			"context": {},
		})
	form = CreateUserForm()

	if request.method == "POST":
		form = CreateUserForm(request.POST)
		if form.is_valid():
			form.save()
			messages.success(request, "Account created successfully!")
			# WAS: return redirect("login")
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

	context = {"form": form}
	# WAS: return render(request, "register.html", context)
	# TODO: WARNING: Modify the hard-coded form if any change is make to the CreateUserForm part
	return JsonResponse({
		"success": True,
		"message": "",
		"redirect": False,
		"redirect_url": "",
		"context": {"form": '<form method="POST" action class="row row-cols-1"><div class="col">Display name <input type="text" name="display_name" maxlength="50" required id="id_display_name"></div><div class="col">Username <input type="text" name="username" maxlength="50" autofocus required id="id_username"></div><div class="col">Password <input type="password" name="password1" autocomplete="new-password" required id="id_password1"></div><div class="col">Password confirmation <input type="password" name="password2" autocomplete="new-password" required id="id_password2"></div><button type="submit" class="col btn btn-primary">Submit</button></form>'},
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
		return JsonResponse({
			"success": True,
			"message": "User already logged in",
			"redirect": True,
			"redirect_url": "index",
			"context": {},
		})
	if request.method == "POST":
		username = request.POST.get("username")
		password = request.POST.get("password")
		user = authenticate(request, username=username, password=password)

		if user is not None:
			return pass2fa(request, user)
		else:
			# WAS: messages.info(request, "Username or password is incorrect")
			message = "Username or password is incorrect"

	# WAS: return render(request, "login.html")
	return JsonResponse({
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
				# "key": encoded_secret.decode("utf-8")
			},
		})
	else:
		# auth_login(request, user_obj)
		user_obj.status = "online"
		user_obj.save()
		# WAS: return redirect("index")
		return JsonResponse({
			"success": True,
			"message": "Login completed",
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
			user.status = "online"
			user.save()
			# WAS: return redirect("index")
			return JsonResponse({
				"success": True,
				"message": "2FA passed successfully",
				"redirect": True,
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

# /logout
# GET: Logs out the logged-in user
@jwt_required
def logout(request):
	# auth_logout(request)
	user = PongueUser.objects.get(username=get_user_from_jwt(request))
	user.status = "offline"
	user.save()
	# WAS: return redirect("login")
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
				"redirect_uri": "https://127.0.0.1:8000/auth",
			}
			auth_response = requests.post("https://api.intra.42.fr/oauth/token", data=data)
			access_token = auth_response.json()["access_token"]
			user_response = requests.get("https://api.intra.42.fr/v2/me", headers={"Authorization": f"Bearer {access_token}"})
			username = user_response.json()["login"]
			display_name = user_response.json()["displayname"]

			try:
				user = PongueUser.objects.get(username=username)
				if (user.from_42):
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
				user.status = "online"
				user.save()
				# WAS: return redirect("index")
				return JsonResponse({
					"success": True,
					"message": "Login completed",
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
		body = json.loads(request.body)
		username = body.get("username")
		action = body.get("action")
		user = get_object_or_404(PongueUser, username=get_user_from_jwt(request))
		friend = get_object_or_404(PongueUser, username=username)
		if action == "add":
			PlayerFriend.search_or_create(get_user_from_jwt(request), username)
		elif action == "remove":
			user.friends.remove(friend)
		user.save()
		return JsonResponse({
			"success": True,
			"message": "",
			"redirect": True,
			"redirect_url": "index",
			"context": {},
		})
	elif request.method == "GET":
		# user = PongueUser.objects.get(username=get_user_from_jwt(request))
		# friends = list(user.friends.values_list("username", flat=True))
		friends = list(PlayerFriend.objects.filter(myFriend__username=get_user_from_jwt(request)).values("myFriend__username", "myFriend", "status"))
		return JsonResponse({
			"success": True,
			"message": "",
			"redirect": False,
			"redirect_url": "",
			"context": {"friends": friends},
		})
	else:
		return JsonResponse({
			"success": False,
			"message": "Invalid method",
			"redirect": True,
			"redirect_url": "login",
			"context": {}
		})

# /add_game_result
# POST: Adds a game result to the database¡
# Parameters: "player_1", "player_2", "player_1_score", "player_2_score"
# Format: application/x-www-form-urlencoded
def add_game_result(request):
	if request.method == "POST":
		player_1 = PongueUser.objects.get(username=request.POST.get("player_1"))
		player_2 = PongueUser.objects.get(username=request.POST.get("player_2"))
		player_1_score = request.POST.get("player_1_score")
		player_2_score = request.POST.get("player_2_score")
		game = GameResults(player_1=player_1, player_2=player_2, player_1_score=player_1_score, player_2_score=player_2_score)
		game.save()
		player_1.games_played += 1
		player_2.games_played += 1
		if player_1_score > player_2_score:
			player_1.games_won += 1
			player_2.games_lost += 1
		elif player_1_score < player_2_score:
			player_1.games_lost += 1
			player_2.games_won += 1
		player_1.save()
		player_2.save()
		return JsonResponse({
			"success": True,
			"message": "",
			"redirect": True,
			"redirect_url": "index",
			"context": {},
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
		jsonUser = serializers.serialize("json", [PongueUser.objects.get(username=get_user_from_jwt(request))])
		return JsonResponse({
			"success": True,
			"message": "",
			"redirect": False,
			"redirect_url": "",
			"context": {
				"user": json.loads(jsonUser)[0]["fields"],
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
