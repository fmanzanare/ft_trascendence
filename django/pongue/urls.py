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
	path("api/check_jwt/", views.check_jwt, name="check_jwt"),
	path("api/profile/", views.profile, name="profile"),
	path("api/profile_id/", views.profile_id, name="profile_id"),
	path("api/get_user_id/", views.get_user_id, name="get_user_id"),
	path("api/get2fa/", views.get2fa, name="get2fa"),
	path("api/user_status/", views.user_status, name="user_status"),
	path("api/ranking/", views.ranking, name="ranking"),
	path("api/user_history/", views.user_history, name="user_history"),
	path("api/nickname/", views.nickname, name="nickname"),
	path("api/online-status/", views.change_status_to_online, name="online_status"),
	path("api/offline-status/", views.change_status_to_offline, name="offline_status"),
	path("api/chatMessages/<chatId>/", views.chatMessages, name="chatMessages"),
]
