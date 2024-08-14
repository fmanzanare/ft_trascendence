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
		if "message" in text_data_json.keys() and \
			"chatId" in text_data_json.keys() and \
			"senderId" in text_data_json.keys() and \
			"gameInvitation" in text_data_json.keys() and \
			"gameInvitationResponse" in text_data_json.keys():

			message = text_data_json["message"]
			chatId: PlayerFriend = await sync_to_async(PlayerFriend.objects.get)(id=text_data_json["chatId"])
			senderId: PongueUser = await sync_to_async(PongueUser.objects.get)(id=text_data_json["senderId"])

			# Save message to database
			if message:
				await sync_to_async(ChatMessage.createMessage)(chatId.id, senderId, message)

			# await self.channel_layer.group_send(
			# 	self.room_group_name, {"type": "chat.message", "message": message, "senderUsername": senderId.username}
			# )
			await self.channel_layer.group_send(
				self.room_group_name, {
					"type": "chat.message",
					"message": message,
					"senderUsername": senderId.username,
					"senderId": senderId.id,
					"gameInvitation": text_data_json["gameInvitation"],
					"gameInvitationResponse": text_data_json.get("gameInvitationResponse")
				}
			)
			return 

	# Receive message from room group
	async def chat_message(self, event):
		if ("message" in event.keys()):
			message = event["message"]

			# Send message to WebSocket
			print(event.get("gameInvitation"))
			await self.send(text_data=json.dumps({
				"message": message,
				"senderUsername": event["senderUsername"],
				"senderId": event["senderId"],
				"gameInvitation": event.get("gameInvitation"),
				"gameInvitationResponse": event.get("gameInvitationResponse")
			}))