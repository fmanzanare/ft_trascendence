import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from chat.models import Chat, ChatMessage


class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
		self.room_group_name = f"chat_{self.room_name}"

		# Join room group
		await self.channel_layer.group_add(self.room_group_name, self.channel_name)

		await self.accept()

	async def disconnect(self, close_code):
		# Leave room group
		await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

	# Receive message from WebSocket
	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		if "message" in text_data_json.keys():
			message = text_data_json["message"]
			await self.channel_layer.group_send(
				self.room_group_name, {"type": "chat.message", "message": message}
			)
			return 

	# Receive message from room group
	async def chat_message(self, event):
		if ("message" in event.keys()):
			message = event["message"]

			# Send message to WebSocket
			await self.send(text_data=json.dumps({"message": message}))
