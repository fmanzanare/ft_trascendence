from django.urls import re_path

from . import tournament_consumer
from . import game_consumer
from . import status_consumer

websocket_urlpatterns = [
	re_path(r"api/ws/status/(?P<user_id>\w+)/$", status_consumer.StatusConsumer.as_asgi()),
	re_path(r"api/ws/remote/(?P<player_id>\w+)/$", game_consumer.GameConsumer.as_asgi()),
	re_path(r"api/ws/tournament/(?P<player_id>\w+)/$", tournament_consumer.TournamentConsumer.as_asgi()),
]
