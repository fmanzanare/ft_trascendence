from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    # re_path(r"ws/remote/(?P<player_id>\w+)/$", consumers.RemoteConsumer.as_asgi()),
]
