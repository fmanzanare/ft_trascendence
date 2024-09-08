import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .new_game import Game
from pongue.models import PongueUser
from django.db import close_old_connections
from channels.db import database_sync_to_async

class GameConsumer(AsyncWebsocketConsumer):
    rooms = {}

    async def connect(self):
        if (self.scope["user"].is_authenticated):
            self.accept()
        else:
            self.close()

        self.room_name = self.scope["url_route"]["kwargs"]["player_id"]
        self.room_group_name = f"game_{self.room_name}"

        if self.room_group_name in self.rooms and len(self.rooms[self.room_group_name]["players"]) >= 2:
            await self.accept()
            await self.close(4001)
            return

        if self.room_group_name not in self.rooms.keys():
            self.rooms[self.room_group_name] = {"players": {"player1": -1}}
            self.rooms[self.room_group_name]["game"] = Game(1, 2)
            self.game: Game = self.rooms[self.room_group_name]["game"]
            self.game.sockets["player1"] = self
        else:
            self.game: Game = self.rooms[self.room_group_name]["game"]
            self.rooms[self.room_group_name]["players"]["player2"] = -1
            self.game.sockets["player2"] = self

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)

        if ("register" in data.keys()):
            player: PongueUser = await self.getUser(data["userId"])
            if (self.rooms[self.room_group_name]["players"]["player1"] == -1):
                self.rooms[self.room_group_name]["players"]["player1"] = player
                self.game.pOne.playerId = data["userId"]
                self.game.pOne.playerName = player.username
            else:
                self.rooms[self.room_group_name]["players"]["player2"] = player 
                self.game.pTwo.playerId = data["userId"]
                self.game.pTwo.playerName = player.username
                await self.channel_layer.group_send(
                    self.room_group_name, {
                        "type": "game.ready",
                        "gameData": True,
                        "pOneId": self.game.pOne.playerId,
                        "pOneName": self.game.pOne.playerName,
                        "pTwoId": self.game.pTwo.playerId,
                        "pTwoName": self.game.pTwo.playerName
                    }
			    )
                self.game_task = asyncio.create_task(self.game.runGame())
            return
            
        if ("playerMovement" in data.keys()):
            if (data["userId"] == self.game.pOne.playerId):
                if (data["movementDir"] == 1):
                    self.game.pOne.setUpMovement(data["playerMovement"])
                else:
                    self.game.pOne.setDownMovement(data["playerMovement"])
            else:
                if (data["movementDir"] == 1):
                    self.game.pTwo.setUpMovement(data["playerMovement"])
                else:
                    self.game.pTwo.setDownMovement(data["playerMovement"])
            return
        
    async def game_ready(self, event):
        await self.send(text_data=json.dumps({
            "gameReady": True,
            "gameData": True,
            "pOneId": event["pOneId"],
            "pOneName": event["pOneName"],
            "pTwoId": event["pTwoId"],
            "pTwoName": event["pTwoName"],
            "ballPosX": self.game.ball.xPos,
            "ballPosY": self.game.ball.yPos,
            "pOnePosX": self.game.pOne.xPos,
            "pOnePosY": self.game.pOne.yPos,
            "pTwoPosX": self.game.pTwo.xPos,
            "pTwoPosY": self.game.pTwo.yPos,
        }))

    async def disconnect(self, close_code):
        if (self.room_group_name in self.rooms):
            playerFromRoom: PongueUser = self.rooms[self.room_group_name]["players"][await self.findSocketInGameSockets()]
            await asyncio.sleep(0.2)
            player: PongueUser = await self.getUser(playerFromRoom.id)
            print(player.id)
            print(player.status)
            if player.status != PongueUser.Status.OFFLINE:
                player.status = PongueUser.Status.ONLINE # TODO: Issue avoiding double loggin
            await self.saveUserChanges(player)
            if (len(self.rooms[self.room_group_name]["players"]) == 1):
                self.rooms.pop(self.room_group_name)
                if (hasattr(self, "game_task") and self.game_task != None):
                    self.game_task.cancel()
                await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            else:
                self.rooms[self.room_group_name]["players"].pop(await self.findSocketInGameSockets())
                self.game.disFlags[await self.findSocketInGameSockets()] = True

    async def findSocketInGameSockets(self):
        if (self.game.sockets["player1"] == self):
            return "player1"
        elif (self.game.sockets["player2"] == self):
            return "player2"
    
    @database_sync_to_async
    def getUser(self, userId):
        close_old_connections()
        return PongueUser.objects.get(id=userId)
    
    @database_sync_to_async
    def saveUserChanges(self, user):
        close_old_connections()
        user.save()
