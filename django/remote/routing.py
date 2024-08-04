from django.urls import re_path

from . import tournament_consumer
from . import game_consumer

websocket_urlpatterns = [
	re_path(r"api/ws/remote/(?P<player_id>\w+)/$", game_consumer.GameConsumer.as_asgi()),
	re_path(r"api/ws/tournament/(?P<player_id>\w+)/$", tournament_consumer.TournamentConsumer.as_asgi()),
]
