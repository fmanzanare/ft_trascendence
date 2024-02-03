from django.urls import path
from . import views

urlpatterns = [
	path("", views.index, name="index"),
	path("register/", views.register, name="register"),
	path("api/login/", views.login, name="login"),
	path("logout/", views.logout, name="logout"),
	path("auth/", views.auth, name="auth"),
	path("submit2fa/", views.submit2fa, name="submit2fa"),
	path("enable2fa/", views.enable2fa, name="enable2fa"),
	path("disable2fa/", views.disable2fa, name="disable2fa"),
]
