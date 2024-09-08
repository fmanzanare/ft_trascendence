import json
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
from .new_game import Game
from pongue.models import PongueUser, Tournament
from django.db import close_old_connections
from channels.db import database_sync_to_async

class TournamentConsumer(AsyncWebsocketConsumer):
    rooms = {}

    async def connect(self):
        if (self.scope["user"].is_authenticated):
            self.accept()
        else:
            self.close()
        
        self.room_name = self.scope["url_route"]["kwargs"]["player_id"]
        self.room_group_name = f"tournament_{self.room_name}"

        if self.room_group_name in self.rooms and len(self.rooms[self.room_group_name]) >= 4:
            await self.accept()
            await self.close(4001)
            return
        
        if self.room_group_name not in self.rooms.keys():
            self.rooms[self.room_group_name] = {}
            self.rooms[self.room_group_name]["players"] = {"player1": -1}
            self.rooms[self.room_group_name]["sockets"] =  {"player1": self}
        elif "player2" not in self.rooms[self.room_group_name]["players"].keys():
            self.rooms[self.room_group_name]["players"]["player2"] = -1
            self.rooms[self.room_group_name]["sockets"]["player2"] = self
        elif "player3" not in self.rooms[self.room_group_name]["players"].keys():
            self.rooms[self.room_group_name]["players"]["player3"] = -1
            self.rooms[self.room_group_name]["sockets"]["player3"] = self
        else:
            self.rooms[self.room_group_name]["players"]["player4"] = -1
            self.rooms[self.room_group_name]["sockets"]["player4"] = self
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    # Received from client method.
    async def receive(self, text_data):
        data = json.loads(text_data)

        if ("register" in data.keys()):
            player: PongueUser = await self.getUser(data["userId"])
            if (self.rooms[self.room_group_name]["players"]["player1"] == -1):
                self.rooms[self.room_group_name]["players"]["player1"] = player
            elif (self.rooms[self.room_group_name]["players"]["player2"] == -1):
                self.rooms[self.room_group_name]["players"]["player2"] = player
            elif (self.rooms[self.room_group_name]["players"]["player3"] == -1):
                self.rooms[self.room_group_name]["players"]["player3"] = player
            else:
                self.rooms[self.room_group_name]["players"]["player4"] = player
                await self.changeUsersStatusToInTournament("player1")
                await self.changeUsersStatusToInTournament("player2")
                await self.changeUsersStatusToInTournament("player3")
                await self.changeUsersStatusToInTournament("player4")

                await self.channel_layer.group_send(
					self.room_group_name, {
						"type": "matchmaking.bracket",
						"match1": "{}, {}".format(self.rooms[self.room_group_name]["players"]["player1"].nickname, self.rooms[self.room_group_name]["players"]["player2"].nickname),
						"match1Ids": "{}, {}".format(self.rooms[self.room_group_name]["players"]["player1"].id, self.rooms[self.room_group_name]["players"]["player2"].id),
						"match2": "{}, {}".format(self.rooms[self.room_group_name]["players"]["player3"].nickname, self.rooms[self.room_group_name]["players"]["player4"].nickname),
						"match2Ids": "{}, {}".format(self.rooms[self.room_group_name]["players"]["player3"].id, self.rooms[self.room_group_name]["players"]["player4"].id)
					}
                )

                asyncio.create_task(self.build_tournament())
            return
        
        if ("playerMovement" in data.keys()):
            await self.makePlayerMove(data)
            return

    async def disconnect(self, close_code):
        if (self.room_group_name in self.rooms):
            playerFromRoom: PongueUser = self.rooms[self.room_group_name]["players"][await self.findSocketInGameSockets()]
            await asyncio.sleep(0.2)
            player: PongueUser = await self.getUser(playerFromRoom.id)
            if player.status != PongueUser.Status.OFFLINE:
                player.status = PongueUser.Status.ONLINE
            await self.saveUserChanges(player)
            if (self.room_group_name in self.rooms.keys() and len(self.rooms[self.room_group_name]["players"]) == 1):
                self.rooms.pop(self.room_group_name)
                await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            elif (
                await self.findPlayerSocket() == "player1" and
                len(self.rooms[self.room_group_name]["players"]) < 4 and
                "onProgress" not in self.rooms[self.room_group_name]
                ): 
                await self.channel_layer.group_send(
					self.room_group_name, {
						"type": "cancel.tournament"
					}
                )
                self.rooms[self.room_group_name]["players"].pop(await self.findPlayerSocket())
                self.rooms[self.room_group_name]["sockets"].pop(await self.findPlayerSocket())
                self.rooms.pop(self.room_group_name)
            else:
                if ("onProgress" in self.rooms[self.room_group_name]):
                    await self.manageSocketDisconnectionFromGame()
                self.rooms[self.room_group_name]["players"].pop(await self.findPlayerSocket())
                self.rooms[self.room_group_name]["sockets"].pop(await self.findPlayerSocket())
        return
        

    # Received from Group and sending back to client methods
    async def matchmaking_bracket(self, event):
        await self.send(text_data=json.dumps({
            "bracket": event
        }))

    async def game_ready(self, event):
        await self.send(text_data=json.dumps({
            "ids": event,
        }))
    
    async def semifinal_winners(self, event):
        await self.send(text_data=json.dumps({
            "semifinalWinners": True,
            "pOneId": event["pOneId"],
            "pOneName": event["pOneName"],
            "pTwoId": event["pTwoId"],
            "pTwoName": event["pTwoName"],
            "matchId": event["matchId"]
        }))
    
    async def final_winner(self, event):
        await self.send(text_data=json.dumps({
            "finalWinner": True,
            "tournamentWinner": event["tournamentWinner"]
        }))
    
    async def cancel_tournament(self, event):
        await self.send(text_data=json.dumps({
            "cancelTournament": True
        }))
    
    # Auxiliar methods
    async def changeUsersStatusToInTournament(self, userNum: str):
        userFromRoom: PongueUser = self.rooms[self.room_group_name]["players"][userNum]
        user: PongueUser = await self.getUser(userFromRoom.id)
        user.status = PongueUser.Status.INTOURNAMENT
        await self.saveUserChanges(user)

    async def getPlayerFromRoom(self, userNum: str):
        if (userNum in self.rooms[self.room_group_name]["players"].keys()):
            return self.rooms[self.room_group_name]["players"][userNum]
        else:
            return ""
    
    async def getSocketFromRoom(self, userNum: str):
        if (self.room_group_name in self.rooms.keys() and userNum in self.rooms[self.room_group_name]["sockets"].keys()):
            return self.rooms[self.room_group_name]["sockets"][userNum]
        else:
            return ""
    
    async def getGameFromRoom(self, gameNum: str):
        return self.rooms[self.room_group_name]["games"][gameNum]
    
    async def findSocketInGames(self):
        game1: Game = await self.getGameFromRoom("match1")
        game2: Game = await self.getGameFromRoom("match2")
        game3: Game = await self.getGameFromRoom("match3")

        if (game3 == False):
            if (game1.sockets["player1"] == self):
                return {"match": "match1", "player": "player1"}
            elif (game1.sockets["player2"] == self):
                return {"match": "match1", "player": "player2"}
            elif (game2.sockets["player1"] == self):
                return {"match": "match2", "player": "player1"}
            elif (game2.sockets["player2"] == self):
                return {"match": "match2", "player": "player2"}
        else:
            if (game3.sockets["player1"] == self):
                return {"match": "match3", "player": "player1"}
            elif (game3.sockets["player2"] == self):
                return {"match": "match3", "player": "player2"}
    
    async def findPlayerSocket(self):
        player1: TournamentConsumer = await self.getSocketFromRoom("player1")
        player2: TournamentConsumer = await self.getSocketFromRoom("player2")
        player3: TournamentConsumer = await self.getSocketFromRoom("player3")
        player4: TournamentConsumer = await self.getSocketFromRoom("player4")

        if (self == player1):
            return "player1"
        elif (self == player2):
            return "player2"
        elif (self == player3):
            return "player3"
        elif (self == player4):
            return "player4"
        
    async def findSocketInGameSockets(self):
        if ("player1" in self.rooms[self.room_group_name]["sockets"] and self.rooms[self.room_group_name]["sockets"]["player1"] == self):
            return "player1"
        elif ("player2" in self.rooms[self.room_group_name]["sockets"] and self.rooms[self.room_group_name]["sockets"]["player2"] == self):
            return "player2"
        elif ("player3" in self.rooms[self.room_group_name]["sockets"] and self.rooms[self.room_group_name]["sockets"]["player3"] == self):
            return "player3"
        elif ("player4" in self.rooms[self.room_group_name]["sockets"] and self.rooms[self.room_group_name]["sockets"]["player4"] == self):
            return "player4"

    async def getPlayerWithId(self, id):
        player1: PongueUser = await self.getPlayerFromRoom("player1")
        player2: PongueUser = await self.getPlayerFromRoom("player2")
        player3: PongueUser = await self.getPlayerFromRoom("player3")
        player4: PongueUser = await self.getPlayerFromRoom("player4")

        if (player1 != "" and player1.id == id):
            return player1
        elif (player2 != "" and player2.id == id):
            return player2
        elif (player3 != "" and player3.id == id):
            return player3
        elif (player4 != "" and player4.id == id):
            return player4

    async def manageSocketDisconnectionFromGame(self):
        disc = await self.findSocketInGames()
        if (disc != None):
            game: Game = await self.getGameFromRoom(disc["match"])
            game.disFlags[disc["player"]] = True

    async def makePlayerMove(self, data):
        target = data["userId"]

        game1: Game = await self.getGameFromRoom("match1")
        game2: Game = await self.getGameFromRoom("match2")
        game3: Game = await self.getGameFromRoom("match3")

        if (game3 == False):
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
            else:
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
            else:
                if (data["movementDir"] == 1):
                    game3.pTwo.setUpMovement(data["playerMovement"])
                else:
                    game3.pTwo.setDownMovement(data["playerMovement"])
    
    # Tournament logic/loop method
    async def build_tournament(self):
        self.rooms[self.room_group_name]["onProgress"] = True
        self.rooms[self.room_group_name]["games"] = {"match1": False, "match2": False, "match3": False}

        # Getting players and sockets form the room
        player1: PongueUser = await self.getPlayerFromRoom("player1")
        player1Socket: TournamentConsumer = await self.getSocketFromRoom("player1")

        player2: PongueUser = await self.getPlayerFromRoom("player2")
        player2Socket: TournamentConsumer = await self.getSocketFromRoom("player2")

        player3: PongueUser = await self.getPlayerFromRoom("player3")
        player3Socket: TournamentConsumer = await self.getSocketFromRoom("player3")

        player4: PongueUser = await self.getPlayerFromRoom("player4")
        player4Socket: TournamentConsumer = await self.getSocketFromRoom("player4")

        # Building games 1 and 2
        game1: Game = Game(player1.id, player2.id)
        game1.pOne.playerName = player1.nickname
        game1.pTwo.playerName = player2.nickname
        game1.sockets = {"player1": player1Socket, "player2": player2Socket}
        game1.matchId = 1
        self.rooms[self.room_group_name]["games"]["match1"] = game1

        game2: Game = Game(player3.id, player4.id)
        game2.pOne.playerName = player3.nickname
        game2.pTwo.playerName = player4.nickname
        game2.sockets = {"player1": player3Socket, "player2": player4Socket}
        game2.matchId = 2
        self.rooms[self.room_group_name]["games"]["match2"] = game2

        # Notifying players about the start of the games
        await self.channel_layer.group_send(
			self.room_group_name, {
				"type": "game.ready",
				"gameReady": True,
				"pOneId": player1.id,
				"pOneName": player1.nickname,
				"pTwoId": player2.id,
				"pTwoName": player2.nickname,
				"matchId": game1.matchId
			}
		)
        
        await self.channel_layer.group_send(
			self.room_group_name, {
				"type": "game.ready",
				"gameReady": True,
				"pOneId": player3.id,
				"pOneName": player3.nickname,
				"pTwoId": player4.id,
				"pTwoName": player4.nickname,
				"matchId": game2.matchId
			}
		)

        # Run Semifinals
        flag = asyncio.Event()
        semifinalTask = asyncio.create_task(self.getSemifinalWinners(game1, game2, flag))
        await flag.wait()
        semifinalTask.cancel()

        if (len(self.rooms[self.room_group_name]["players"]) == 1):
            winnerId = self.rooms[self.room_group_name]["players"][list(self.rooms[self.room_group_name]["players"].keys())[-1]].id
            await self.registerTournmanet(player1, player2, player3, player4, winnerId)
            await self.channel_layer.group_send(
                self.room_group_name, {
                    "type": "final.winner",
                    "finalWinner": True,
                    "tournamentWinner": winnerId
                }
            )
            return

        game3: Game = Game(game1.winner, game2.winner)
        semifinalSockets = await self.getSemifinalWinnerSockets(game1.winner, game2.winner)
        winner1: PongueUser = await self.getPlayerWithId(game1.winner)
        winner2: PongueUser = await self.getPlayerWithId(game2.winner)
        game3.pTwo.playerName = winner1.nickname
        game3.pTwo.playerName = winner2.nickname
        game3.sockets["player1"] = semifinalSockets["winner1"]
        game3.sockets["player2"] = semifinalSockets["winner2"]
        game3.matchId = 3
        self.rooms[self.room_group_name]["games"]["match3"] = game3

        await self.channel_layer.group_send(
            self.room_group_name, {
                "type": "semifinal.winners",
                "semifinalWinners": True,
                "pOneId": game1.winner,
                "pOneName": winner1.nickname,
                "pTwoId": game2.winner,
                "pTwoName": winner2.nickname,
                "matchId": game3.matchId
            }
        )

        # Run Final
        flag = asyncio.Event()
        finalTask = asyncio.create_task(self.getFinalWinner(game3, flag))
        await flag.wait()
        finalTask.cancel()

        await self.registerTournmanet(player1, player2, player3, player4, game3.winner)

        await self.channel_layer.group_send(
            self.room_group_name, {
                "type": "final.winner",
                "finalWinner": True,
                "tournamentWinner": game3.winner,
                "matchId": game3.matchId
            }
        )

    async def registerTournmanet(self, player1, player2, player3, player4, winnerId):
        player1ToSave: PongueUser = await self.getUser(player1.id)
        player1ToSave.tournaments += 1
        await self.saveUserChanges(player1ToSave)
        player2ToSave: PongueUser = await self.getUser(player2.id)
        player2ToSave.tournaments += 1
        await self.saveUserChanges(player2ToSave)
        player3ToSave: PongueUser = await self.getUser(player3.id)
        player3ToSave.tournaments += 1
        await self.saveUserChanges(player3ToSave)
        player4ToSave: PongueUser = await self.getUser(player4.id)
        player4ToSave.tournaments += 1
        await self.saveUserChanges(player4ToSave)
        tournamentWinner: PongueUser = await self.getUser(winnerId)
        await self.createTournament(player1, player2, player3, player4, tournamentWinner)
        tournamentWinner.points += 10
        tournamentWinner.tournaments_won += 1
        await self.saveUserChanges(tournamentWinner)

    async def getSemifinalWinners(self, game1: Game, game2: Game, flag):
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

    async def getSemifinalWinnerSockets(self, winner1, winner2):
        sockets = {"winner1": None, "winner2": None}
        player1 = await self.getPlayerFromRoom("player1")
        player3 = await self.getPlayerFromRoom("player3")

        if player1 != "" and winner1 == player1.id:
            sockets["winner1"] = await self.getSocketFromRoom("player1")
        else:
            sockets["winner1"] = await self.getSocketFromRoom("player2")
        
        if player3 != "" and winner2 == player3.id:
            sockets["winner2"] = await self.getSocketFromRoom("player3")
        else:
            sockets["winner2"] = await self.getSocketFromRoom("player4")
        
        return sockets
    
    async def getFinalWinner(self, game3: Game, flag):
        game3Task = asyncio.create_task(game3.runGame())
        winner = False
        while not winner:
            await asyncio.sleep(5)
            winner = game3.winner
        
        game3Task.cancel()
        flag.set()

    @database_sync_to_async
    def getUser(self, userId):
        close_old_connections()
        return PongueUser.objects.get(id=userId)
    
    @database_sync_to_async
    def saveUserChanges(self, user):
        close_old_connections()
        user.save()

    @database_sync_to_async
    def createTournament(self, player1, player2, player3, player4, tournamentWinner):
        close_old_connections()
        Tournament.objects.create(
            player_1=player1,
            player_2=player2,
            player_3=player3,
            player_4=player4,
            winner=tournamentWinner
        )