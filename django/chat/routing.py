from django.urls import re_path

from . import consumers
from . import friendshipConsumer

websocket_urlpatterns = [
    re_path(r"api/ws/chat/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(r"api/ws/friendship/(?P<room_name>\w+)/$", friendshipConsumer.FriendshipConsumer.as_asgi()),
]
