import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer


class RemoteConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.room_name = self.scope["url_route"]["kwargs"]["player_id"]
		self.room_group_name = f"game_{self.room_name}"

		await self.channel_layer.group_add(self.room_group_name, self.channel_name)

		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

	async def receive(self, text_data):
		game_info_json = json.loads(text_data)
		ready = game_info_json["gameReady"]

		await self.channel_layer.group_send(
			self.room_group_name, {"type": "game.info", "data": ready}
		)

	async def game_info(self, event):
		info = event["data"]

		await self.send(text_data=json.dumps({"gameReady": info}))
