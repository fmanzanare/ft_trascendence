from django.urls import re_path

from . import consumers
from . import new_consumers

websocket_urlpatterns = [
	re_path(r"ws/remote/(?P<player_id>\w+)/$", new_consumers.GameConsumer.as_asgi()),
	re_path(r"ws/tournament/(?P<player_id>\w+)/$", consumers.TournamentConsumer.as_asgi()),
]
