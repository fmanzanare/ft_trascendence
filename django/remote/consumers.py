import json
import random

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer


class RemoteConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.room_name = self.scope["url_route"]["kwargs"]["player_id"]
		self.room_group_name = f"game_{self.room_name}"

		# Join Room group
		await self.channel_layer.group_add(self.room_group_name, self.channel_name)

		await self.accept()

	async def disconnect(self, close_code):
		# Leave from Room group
		await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

	# Receive data from WebSocket
	async def receive(self, text_data):
		game_info_json = json.loads(text_data)
		# Takes place when the user connects to the room.
		ready = game_info_json["gameReady"]

		# Send message to Room group
		if ready != None:
			# Add function to calculate initial positions and ball direction.
			# Send info to consumer to instantiate the Game.
			ballDir = self.calculateInitialGameInfo()

			await self.channel_layer.group_send(
				self.room_group_name, {
					"type": "game.info",
					"data": ready,
					"ballDir": ballDir
				}
			)
			return

		# Takes place when the game starts (it shares the players position and scores).
		game_data = game_info_json["gameData"]

	# Recive data from Room group
	async def game_info(self, event):
		ready = event["data"]
		ballDir = event["ballDir"]

		# Send message to WebSocket
		await self.send(text_data=json.dumps({"gameReady": ready, "ballDir": ballDir}))

	def calculateInitialGameInfo(self):
		initDirX = -1 if random.random() < 0.5 else 1
		initDirY = -1 if random.random() < 0.5 else 1
		rand = random.random()

		ballDirX = 0.5 * initDirX
		ballDirY = (0.6 if rand > 0.6 else rand) * initDirY
		return {"ballDirX": ballDirX, "ballDirY": ballDirY}

