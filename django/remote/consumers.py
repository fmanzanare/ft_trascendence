import json
import random
import asyncio
import copy

from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import Game
from pongue.models import GameResults, PongueUser, Tournament
from pongue.views import jwt_required, get_user_from_jwt

class TournamentConsumer(AsyncWebsocketConsumer):
	rooms = {}

	async def connect(self):
		if (self.scope["user"].is_authenticated):
			self.accept()
		else:
			self.close()

		self.room_name = self.scope["url_route"]["kwargs"]["player_id"]
		self.room_group_name = f"tournament_{self.room_name}"

		if self.room_group_name in self.rooms and "tournament" in self.rooms[self.room_group_name]:
			await self.accept()
			await self.close(4001)
			return

		if self.room_group_name not in self.rooms.keys():
			self.rooms[self.room_group_name] = {"players": {"player1": -1}}
		elif "player2" not in self.rooms[self.room_group_name]["players"].keys():
			self.rooms[self.room_group_name]["players"]["player2"] = -1
		elif "player3" not in self.rooms[self.room_group_name]["players"].keys():
			self.rooms[self.room_group_name]["players"]["player3"] = -1
		else:
			self.rooms[self.room_group_name]["players"]["player4"] = -1
			self.rooms[self.room_group_name]["tournament"] = True

		# Join Room group
		await self.channel_layer.group_add(self.room_group_name, self.channel_name)

		await self.accept()

	async def disconnect(self, close_code):
		# Leave from Room group
		await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
		if (len(self.channel_layer.groups.get(self.room_group_name, {}).items()) == 0):
			del self.rooms[self.room_group_name]

	# Receive data from WebSocket
	async def receive(self, text_data):
		data = json.loads(text_data)

		if ("register" in data.keys()):
			if (self.rooms[self.room_group_name]["players"]["player1"] == -1):
				self.rooms[self.room_group_name]["players"]["player1"] = await sync_to_async(PongueUser.objects.get)(id=data["userId"])
			elif (self.rooms[self.room_group_name]["players"]["player2"] == -1):
				self.rooms[self.room_group_name]["players"]["player2"] = await sync_to_async(PongueUser.objects.get)(id=data["userId"])
			elif (self.rooms[self.room_group_name]["players"]["player3"] == -1):
				self.rooms[self.room_group_name]["players"]["player3"] = await sync_to_async(PongueUser.objects.get)(id=data["userId"])
			elif (self.rooms[self.room_group_name]["players"]["player4"] == -1):
				self.rooms[self.room_group_name]["players"]["player4"] = await sync_to_async(PongueUser.objects.get)(id=data["userId"])
				userP1 = self.rooms[self.room_group_name]["players"]["player1"]
				userP1.status = PongueUser.Status.INTOURNAMENT
				await sync_to_async(userP1.save)()
				userP2 = self.rooms[self.room_group_name]["players"]["player2"]
				userP2.status = PongueUser.Status.INTOURNAMENT
				await sync_to_async(userP2.save)()
				userP3 = self.rooms[self.room_group_name]["players"]["player3"]
				userP3.status = PongueUser.Status.INTOURNAMENT
				await sync_to_async(userP3.save)()
				userP4 = self.rooms[self.room_group_name]["players"]["player4"]
				userP4.status = PongueUser.Status.INTOURNAMENT
				await sync_to_async(userP4.save)()

				await self.channel_layer.group_send(
					self.room_group_name, {
						"type": "matchmaking.bracket",
						"match1": "{}, {}".format(self.rooms[self.room_group_name]["players"]["player1"].nickname, self.rooms[self.room_group_name]["players"]["player2"].nickname),
						"match1Ids": "{}, {}".format(self.rooms[self.room_group_name]["players"]["player1"].id, self.rooms[self.room_group_name]["players"]["player2"].id),
						"match2": "{}, {}".format(self.rooms[self.room_group_name]["players"]["player3"].nickname, self.rooms[self.room_group_name]["players"]["player4"].nickname),
						"match2Ids": "{}, {}".format(self.rooms[self.room_group_name]["players"]["player3"].id, self.rooms[self.room_group_name]["players"]["player4"].id)
					}
				)

				# TODO - Tournament logic (loop until we got winners, start final match, and get final winner).
				asyncio.create_task(self.build_tournament())

			await self.channel_layer.group_send(
				self.room_group_name, {
					"type": "new.player",
					"hostId": self.rooms[self.room_group_name]["players"]["player1"].id,
					"userId": data["userId"]
				}
			)
			return

		if ("playerMovement" in data.keys()):
			game1: Game = self.rooms[self.room_group_name]["games"]["match1"]
			game2: Game = self.rooms[self.room_group_name]["games"]["match2"]
			game3: Game = self.rooms[self.room_group_name]["games"]["match3"]

			target = data["userId"]

			if (game3 == None):
				if (game1.pOne.playerId == target):
					if (data["movementDir"] == 1):
						game1.pOne.setUpMovement(data["playerMovement"])
					else:
						game1.pOne.setDownMovement(data["playerMovement"])
				elif (game1.pTwo.playerId == target):
					if (data["movementDir"] == 1):
						game1.pTwo.setUpMovement(data["playerMovement"])
					else:
						game1.pTwo.setDownMovement(data["playerMovement"])
				elif (game2.pOne.playerId == target):
					if (data["movementDir"] == 1):
						game2.pOne.setUpMovement(data["playerMovement"])
					else:
						game2.pOne.setDownMovement(data["playerMovement"])
				elif (game2.pTwo.playerId == target):
					if (data["movementDir"] == 1):
						game2.pTwo.setUpMovement(data["playerMovement"])
					else:
						game2.pTwo.setDownMovement(data["playerMovement"])
			else:
				if (game3.pOne.playerId == target):
					if (data["movementDir"] == 1):
						game3.pOne.setUpMovement(data["playerMovement"])
					else:
						game3.pOne.setDownMovement(data["playerMovement"])
				elif (game3.pTwo.playerId == target):
					if (data["movementDir"] == 1):
						game3.pTwo.setUpMovement(data["playerMovement"])
					else:
						game3.pTwo.setDownMovement(data["playerMovement"])
		

	async def new_player(self, event):
		await self.send(text_data=json.dumps({
			"newPlayer": event
		}))
		return

	async def matchmaking_bracket(self, event):
		await self.send(text_data=json.dumps({
			"bracket": event
		}))
		return
	
	async def game_ready(self, event):
		await self.send(text_data=json.dumps({
			"ids": event
		}))
		return

	async def game_info(self, event):
		await self.send(text_data=json.dumps({
			"gameData": True,
			"pOneId": event["pOneId"],
			"pTwoId": event["pTwoId"],
			"ballPosX": event["ballX"],
			"ballPosY": event["ballY"],
			"pOnePosX": event["pOneX"],
			"pOnePosY": event["pOneY"],
			"pTwoPosX": event["pTwoX"],
			"pTwoPosY": event["pTwoY"],
			"matchId": event["matchId"]
		}))

	async def add_point(self, event):
		await self.send(text_data=json.dumps({
			"scoreData": True,
			"pOneScore": event["pOneScore"],
			"pTwoScore": event["pTwoScore"],
			"matchId": event["matchId"]
		}))

	# TODO - Receive data from Game class when game ends.
	async def game_end(self, event):
		await self.send(text_data=json.dumps({
			"gameEnd": True,
			"matchId": event["matchId"]
		}))
		return

	async def semifinal_winners(self, event):
		await self.send(text_data=json.dumps({
			"semifinalWinners": True,
			"pOneId": event["pOneId"],
			"pTwoId": event["pTwoId"],
			"matchId": event["matchId"]
		}))
		return

	async def final_winner(self, event):
		await self.send(text_data=json.dumps({
			"finalWinner": True,
			"tournamentWinner": event["tournamentWinner"],
			"matchId": event["matchId"]
		}))
		return

	async def build_tournament(self):	
		self.rooms[self.room_group_name]["games"] = {"match1": False, "match2": False, "match3": False}

		# TODO - Loop to get players ready State.

		player1 = self.rooms[self.room_group_name]["players"]["player1"]
		player2 = self.rooms[self.room_group_name]["players"]["player2"]
		player3 = self.rooms[self.room_group_name]["players"]["player3"]
		player4 = self.rooms[self.room_group_name]["players"]["player4"]

		print(player1)

		# TODO - Loop to get a Winner in Semifinals.
		game1 = self.rooms[self.room_group_name]["games"]["match1"] = Game(self, player1.id, player2.id)
		game1.matchId = 1
		game2 = self.rooms[self.room_group_name]["games"]["match2"] = Game(self, player3.id, player4.id)
		game2.matchId = 2
		game3 = self.rooms[self.room_group_name]["games"]["match3"] = None

		await self.channel_layer.group_send(
			self.room_group_name, {
				"type": "game.ready",
				"gameReady": True,
				"pOneId": player1.id,
				"pTwoId": player2.id,
				"matchId": game1.matchId
			}
		)

		await self.channel_layer.group_send(
			self.room_group_name, {
				"type": "game.ready",
				"gameReady": True,
				"pOneId": player3.id,
				"pTwoId": player4.id,
				"matchId": game2.matchId
			}
		)

		flag = asyncio.Event()
		semifinalTask = asyncio.create_task(self.getSemifinalWinners(game1, game2, flag))
		await flag.wait()
		semifinalTask.cancel()

		game3 = self.rooms[self.room_group_name]["games"]["match3"] = Game(self, game1.winner, game2.winner)
		game3.matchId = 3

		await self.channel_layer.group_send(
			self.room_group_name, {
				"type": "semifinal.winners",
				"semifinalWinners": True,
				"pOneId": game1.winner,
				"pTwoId": game2.winner,
				"matchId": game3.matchId
			}
		)

		flag = asyncio.Event()
		finalTask = asyncio.create_task(self.getFinalWinner(game3, flag))
		await flag.wait()
		finalTask.cancel()

		await self.channel_layer.group_send(
			self.room_group_name, {
				"type": "final.winner",
				"finalWinner": True,
				"tournamentWinner": game3.winner,
				"matchId": game3.matchId
			}
		)

		return


		# TODO - Loop to get a Winner in Final.

	async def getSemifinalWinners(self, game1, game2, flag):
		game1Task = asyncio.create_task(game1.runGame())
		game2Task = asyncio.create_task(game2.runGame())
		winner1 = False
		winner2 = False
		while not winner1 or not winner2:
			await asyncio.sleep(5)
			winner1 = game1.winner
			winner2 = game2.winner
		
		game1Task.cancel()
		game2Task.cancel()

		flag.set()

	async def getFinalWinner(self, game3, flag):
		game3Task = asyncio.create_task(game3.runGame())
		winner = False
		while not winner:
			await asyncio.sleep(5)
			winner = game3.winner
		
		game3Task.cancel()

		flag.set()
	