from django.urls import path
from . import views

urlpatterns = [
	path("", views.index, name="index"),
	path("register/", views.index, name="index"),
	path("tournament/", views.index, name="index"),
	path("ranking/", views.index, name="index"),
	path("profile/", views.index, name="index"),
	path("home/", views.index, name="index"),
	path("login/", views.index, name="index"),
	path("logout/", views.index, name="index"),
	path("api/register/", views.register, name="register"),
	path("api/login/", views.login, name="login"),
	path("api/logout/", views.logout, name="logout"),
	path("api/auth/", views.auth, name="auth"),
	path("api/submit2fa/", views.submit2fa, name="submit2fa"),
	path("api/enable2fa/", views.enable2fa, name="enable2fa"),
	path("api/disable2fa/", views.disable2fa, name="disable2fa"),
]
