from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from .forms import CreateUserForm
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
import requests
import os
from .models import PongueUser

@login_required(login_url="login")
def index(request):
	return render(request, "index.html")

def register(request):
	if request.user.is_authenticated:
		return redirect("index")
	form = CreateUserForm()

	if request.method == "POST":
		form = CreateUserForm(request.POST)
		if form.is_valid():
			form.save()
			messages.success(request, "Account created successfully!")
			return redirect("login")

	context = {"form": form}
	return render(request, "register.html", context)

def login(request):
	if request.user.is_authenticated:
		return redirect("index")
	if request.method == "POST":
		username = request.POST.get("username")
		password = request.POST.get("password")
		user = authenticate(request, username=username, password=password)

		if user is not None:
			auth_login(request, user)
			return redirect("index")
		else:
			messages.info(request, "Username or password is incorrect")

	return render(request, "login.html")

@login_required(login_url="login")
def logout(request):
	auth_logout(request)
	return redirect("login")



def auth(request):
	if request.method == "GET":
		code = request.GET.get("code")
		if code:
			data = {
				"grant_type": "authorization_code",
				"client_id": os.environ.get("FT_CLIENT_ID"),
				"client_secret": os.environ.get("FT_CLIENT_SECRET"),
				"code": code,
				"redirect_uri": "http://127.0.0.1:8000/auth",
			}
			auth_response = requests.post("https://api.intra.42.fr/oauth/token", data=data)
			access_token = auth_response.json()["access_token"]
			user_response = requests.get("https://api.intra.42.fr/v2/me", headers={"Authorization": f"Bearer {access_token}"})
			username = user_response.json()["login"]
			display_name = user_response.json()["displayname"]

			try:
				user = PongueUser.objects.get(username=username)
				auth_login(request, user)
			except PongueUser.DoesNotExist:
				user = PongueUser.objects.create_user(username=username, display_name=display_name)
				auth_login(request, user)

			return redirect("index")
		else:
			return render(request, "auth.html", {"error": "Invalid authorization code"})
	else:
		return render(request, "auth.html", {"error": "Invalid request method"})
