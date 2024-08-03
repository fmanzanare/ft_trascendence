from django.urls import path
from . import views

urlpatterns = [
	path("", views.index, name="index"),
	path("api/register/", views.register, name="register"),
	path("api/login/", views.login, name="login"),
	path("api/logout/", views.logout, name="logout"),
	path("api/auth/", views.auth, name="auth"),
	path("api/submit2fa/", views.submit2fa, name="submit2fa"),
	path("api/enable2fa/", views.enable2fa, name="enable2fa"),
	path("api/disable2fa/", views.disable2fa, name="disable2fa"),
	path("api/friends/", views.friends, name="friends"),
	path("api/add_game_result/", views.add_game_result, name="add_game_result"),
	path("api/check_jwt/", views.check_jwt, name="check_jwt"),
	path("api/profile/", views.profile, name="profile"),
	path("api/get2fa/", views.get2fa, name="get2fa"),
	path("api/user_status/", views.user_status, name="user_status"),
	path("api/ranking/", views.ranking, name="ranking"),
	path("api/nickname/", views.nickname, name="nickname"),
	path("api/online-status/", views.change_status_to_online, name="online_status"),
]
