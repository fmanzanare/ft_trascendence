from django.urls import path
from . import views


urlpatterns = [
	path('find-game', views.find_game, name="find game"),
	path('cancel-find-game', views.cancel_find_game, name="cancel find game"),
	path('register-result', views.register_result, name="register result"),
	path('find-tournament', views.find_tournament, name="find tournament"),
	path('register-tournament-win', views.register_tournament_win, name="register tournament win"),

]
