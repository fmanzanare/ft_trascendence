from django.urls import path
from . import views


urlpatterns = [
	path('find-game', views.find_game, name="find game")
]
