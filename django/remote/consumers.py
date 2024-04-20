import json
import random
import asyncio

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import Game


class RemoteConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		self.room_name = self.scope["url_route"]["kwargs"]["player_id"]
		self.room_group_name = f"game_{self.room_name}"
		self.game = Game()
		self.game.socket = self
		self.game.hostId = int(self.room_name)

		# Join Room group
		await self.channel_layer.group_add(self.room_group_name, self.channel_name)

		await self.accept()

	async def disconnect(self, close_code):
		# Leave from Room group
		print("disconnecting")
		if (self.game_task != None):
			self.game_task.cancel()
		del self.game
		await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

	# Receive data from WebSocket
	async def receive(self, text_data):
		game_info_json = json.loads(text_data)

		if ("buildGame" in game_info_json.keys()):
			self.game.limits["x"] = game_info_json["limitX"]
			self.game.limits["y"] = game_info_json["limitY"]
			self.game.ballPosition["x"] = game_info_json["ballPosX"]
			self.game.ballPosition["y"] = game_info_json["ballPosY"]
			self.game.ballPosition["leftEdge"] = game_info_json["ballLeftEdge"]
			self.game.ballPosition["rightEdge"] = game_info_json["ballRightEdge"]
			self.game.pOnePosition["x"] = game_info_json["pOnePosX"]
			self.game.pOnePosition["y"] = game_info_json["pOnePosY"]
			self.game.pOnePosition["leftEdge"] = game_info_json["pOneLeftEdge"]
			self.game.pOnePosition["rightEdge"] = game_info_json["pOneRightEdge"]
			self.game.pOnePosition["topEdge"] = game_info_json["pOneTopEdge"]
			self.game.pOnePosition["bottomEdge"] = game_info_json["pOneBottomEdge"]
			self.game.pTwoPosition["x"] = game_info_json["pTwoPosX"]
			self.game.pTwoPosition["y"] = game_info_json["pTwoPosY"]
			self.game.pTwoPosition["leftEdge"] = game_info_json["pTwoLeftEdge"]
			self.game.pTwoPosition["rightEdge"] = game_info_json["pTwoRightEdge"]
			self.game.pTwoPosition["topEdge"] = game_info_json["pTwoTopEdge"]
			self.game.pTwoPosition["bottomEdge"] = game_info_json["pTwoBottomEdge"]
			await self.channel_layer.group_send(
				self.room_group_name, {
					"type": "game.info",
					"gameData": True,
					"sender": game_info_json["userId"],
					"ballPosX": self.game.ballPosition["x"],
					"ballPosY": self.game.ballPosition["y"],
					"pOnePosX": self.game.pOnePosition["x"],
					"pOnePosY": self.game.pOnePosition["y"],
					"pTwoPosX": self.game.pTwoPosition["x"],
					"pTwoPosY": self.game.pTwoPosition["y"],
				}
			)
			self.game_task = asyncio.create_task(self.game.runGame())
			return

		if ("playerMovement" in game_info_json.keys()):
			if (game_info_json["userId"] == self.game.hostId):
				if (game_info_json["movementDir"] == 1):
					self.game.pOneMovement["up"] = game_info_json["playerMovement"]
				else:
					self.game.pOneMovement["down"] = game_info_json["playerMovement"]
			else:
				if (game_info_json["movementDir"] == 1):
					self.game.pTwoMovement["up"] = game_info_json["playerMovement"]
				else:
					self.game.pTwoMovement["down"] = game_info_json["playerMovement"]
			await self.channel_layer.group_send(
				self.room_group_name, {
					"type": "game.info",
					"gameData": True,
					"sender": game_info_json["userId"],
					"ballPosX": self.game.ballPosition["x"],
					"ballPosY": self.game.ballPosition["y"],
					"pOnePosX": self.game.pOnePosition["x"],
					"pOnePosY": self.game.pOnePosition["y"],
					"pTwoPosX": self.game.pTwoPosition["x"],
					"pTwoPosY": self.game.pTwoPosition["y"],
				}
			)
			return

		if ("gameReady" in game_info_json.keys()):
			ready = game_info_json["gameReady"]
			await self.channel_layer.group_send(
				self.room_group_name, {
					"type": "game.info",
					"data": ready
				}
			)
			return

	# Recive data from Room group
	async def game_info(self, event):
		if ("gameData" in event.keys()):
			await self.send(text_data=json.dumps({
				"gameData": True,
				"ballPosX": self.game.ballPosition["x"],
				"ballPosY": self.game.ballPosition["y"],
				"pOnePosX": self.game.pOnePosition["x"],
				"pOnePosY": self.game.pOnePosition["y"],
				"pTwoPosX": self.game.pTwoPosition["x"],
				"pTwoPosY": self.game.pTwoPosition["y"],
			}))
			return

		if ("scoreData" in event.keys()):
			await self.send(text_data=json.dumps({
				"scoreData": True,
				"pOneScore": self.game.score["pOne"],
				"pTwoScore": self.game.score["pTwo"]
			}))
			return

		if ("data" in event.keys()):
			await self.send(text_data=json.dumps({
				"gameReady": True,
				"gameData": True
			}))
			return
