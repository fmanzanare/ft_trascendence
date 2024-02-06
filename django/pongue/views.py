from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from .forms import CreateUserForm
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
import requests
import os
from .models import PongueUser
from .otp import totp
import base64, hashlib
from django.http import JsonResponse

# /
# For the moment, only returns the 2FA key mientras no encontramos un mejor lugar para ponerlo
@login_required(login_url="login")
def index(request):
	hashed_secret = hashlib.sha512((request.user.username + os.environ.get("OTP_SECRET")).encode("utf-8")).digest()
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
	if request.user.is_authenticated:
		# WAS: return redirect("index")
		return JsonResponse({
			"success": True,
			"message": "User already logged in",
			"redirect": True,
			"redirect_url": "index",
			"context": {},
			"logged_in": request.user.is_authenticated,
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
				"logged_in": request.user.is_authenticated,
			})
		else:
			return JsonResponse({
				"success": False,
				"message": "Invalid form",
				"redirect": True,
				"redirect_url": "register",
				"context": {"errors": form.errors.as_json()},
				"logged_in": request.user.is_authenticated,
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
	message = ""
	if request.user.is_authenticated:
		# WAS: return redirect("index")
		return JsonResponse({
			"success": True,
			"message": "User already logged in",
			"redirect": True,
			"redirect_url": "index",
			"context": {},
			"logged_in": request.user.is_authenticated,
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
		"success": True,
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
			"message": "",
			"redirect": True,
			"redirect_url": "pass2fa",
			"context": {
				"user": user_obj.username,
				# "key": encoded_secret.decode("utf-8")
			},
			"logged_in": request.user.is_authenticated,
		})
	else:
		auth_login(request, user_obj)
		# WAS: return redirect("index")
		return JsonResponse({
			"success": True,
			"message": "",
			"redirect": True,
			"redirect_url": "home",
			"context": {},
			"logged_in": request.user.is_authenticated,
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
			auth_login(request, user)
			# WAS: return redirect("index")
			return JsonResponse({
				"success": True,
				"message": "",
				"redirect": True,
				"redirect_url": "index",
				"context": {},
				"logged_in": request.user.is_authenticated,
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

# /disable2fa
# GET: Disables 2FA for the logged-in user
@login_required(login_url="login")
def disable2fa(request):
	user = PongueUser.objects.get(username=request.user)
	user.has_2fa = False
	user.save()
	# WAS: return redirect("index")
	return JsonResponse({
		"success": True,
		"message": "",
		"redirect": True,
		"redirect_url": "index",
		"context": {},
		"logged_in": request.user.is_authenticated,
	})

# /enable2fa
# GET: Enables 2FA for the logged-in user
@login_required(login_url="login")
def enable2fa(request):
	user = PongueUser.objects.get(username=request.user)
	user.has_2fa = True
	user.save()
	# WAS: return redirect("index")
	return JsonResponse({
		"success": True,
		"message": "",
		"redirect": True,
		"redirect_url": "index",
		"context": {},
		"logged_in": request.user.is_authenticated,
	})

# /logout
# GET: Logs out the logged-in user
@login_required(login_url="login")
def logout(request):
	auth_logout(request)
	# WAS: return redirect("login")
	return JsonResponse({
		"success": True,
		"message": "",
		"redirect": True,
		"redirect_url": "login",
		"context": {},
		"logged_in": request.user.is_authenticated,
	})

# /auth
# GET: Logs in the user using the 42 API
def auth(request):
	if request.user.is_authenticated:
		# WAS: return redirect("index")
		return JsonResponse({
			"success": True,
			"message": "",
			"redirect": True,
			"redirect_url": "index",
			"context": {},
			"logged_in": request.user.is_authenticated,
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
				auth_login(request, user)
				# WAS: return redirect("index")
				return JsonResponse({
					"success": True,
					"message": "",
					"redirect": True,
					"redirect_url": "index",
					"context": {},
					"logged_in": request.user.is_authenticated,
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
