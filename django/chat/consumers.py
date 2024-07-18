import json

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatMessage
from pongue.models import PongueUser, PlayerFriend


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
		print(text_data)
		if "message" in text_data_json.keys() and \
			"chatId" in text_data_json.keys() and \
			"senderId" in text_data_json.keys():

			message = text_data_json["message"]
			chatId = await sync_to_async(PlayerFriend.objects.get)(id=text_data_json["chatId"])
			senderId = await sync_to_async(PongueUser.objects.get)(id=text_data_json["senderId"])
			print(f"chatId: {chatId}", f"senderId: {senderId}", f"message: {message}")

			# Save message to database
			await sync_to_async(ChatMessage.createMessage)(chatId.id, senderId, message)

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
