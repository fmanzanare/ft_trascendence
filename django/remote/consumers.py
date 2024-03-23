import json
import random

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import Game


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
		if ("gameReady" in game_info_json.keys()):
			ready = game_info_json["gameReady"]
			# Send message to Room group
			if ready != None:
				# Add function to calculate initial positions and ball direction.
				# Send info to consumer to instantiate the Game.
				game = Game()
				game.calculateRandomBallDir()

				await self.channel_layer.group_send(
					self.room_group_name, {
						"type": "game.info",
						"data": ready,
						"ballDirX": game.ballDir["x"], 
						"ballDirY": game.ballDir["y"] 
					}
				)
				return

		# Takes place when the game starts (it shares the players position and scores).
		if ("gameData" in game_info_json.keys()):
			user_id = game_info_json["userId"]
			player_pos_y = game_info_json["posY"]
			await self.channel_layer.group_send(
				self.room_group_name, {
					"type": "game.info",
					"gameData": True,
					"userId": user_id,
					"posY": player_pos_y
				}
			)
			return

	# Recive data from Room group
	async def game_info(self, event):
		if ("gameData" in event.keys()):
			user_id = event["userId"]
			player_pos_y = event["posY"]
			# Send message to WebSocket
			await self.send(text_data=json.dumps({
				"gameData": True,
				"userId": user_id,
				"posY": player_pos_y
			}))
		elif ("data" in event.keys()):
			ready = event["data"]
			await self.send(text_data=json.dumps({
				"gameReady": ready
			}))
