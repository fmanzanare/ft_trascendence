import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer


class RemoteConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.game_name = self.scope["url_route"]["kwargs"]["player_id"]
		self.game_room_name = f"chat_{self.game_name}"

		await self.channel_layer.group_add(self.game_room_name, self.channel_name)

		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(self.game_room_name, self.channel_name)

	async def receive(self, game_data):
		game_info_json = json.load(game_data)

		await self.channel_layer.group_send(
			self.game_room_name, {"type": "game_data", "data": game_info_json}
		)

	async def game_info(self, event):
		info = event["data"]

		await self.send(text_data=json.dumps({"data": info}))
