import random, asyncio, time, json
from .game_classes import *
from pongue.models import PongueUser, GameResults
from django.db import close_old_connections
from channels.db import database_sync_to_async

class Game:
    def __init__(self, pOneId, pTwoId):
        self.table = Table()
        self.ball = Ball()
        self.limits = Limits(x=self.table.width / 2 + self.ball.totalRadius, y=self.table.height + self.ball.totalRadius)
        self.pOne = Player(leftPlayer=True, playerId=pOneId, playerName='')
        self.pTwo = Player(leftPlayer=False, playerId=pTwoId, playerName='')
        self.score = Score()
        self.sockets = {"player1": -1, "player2": -1}
        self.disFlags = {"player1": False, "player2": False}
        self.ready = False
        self.winner = False
        self.matchId = 0

    def calculateRandomBallDir(self):
        initDirX = -1 if random.random() < 0.5 else 1
        initDirY = -1 if random.random() < 0.5 else 1
        self.ball.xDir = 0.5 * initDirX
        rand = random.random()
        self.ball.yDir = (0.6 if rand > 0.6 else rand) * initDirY

    def checkGameLimitsCollisions(self):
        topCollision = self.ball.yPos >= self.limits.y
        bottomCollision = self.ball.yPos <= 0

        if (topCollision and not self.ball.topCollision):
            self.ball.yDir *= -1
            self.ball.topCollision = True
            self.ball.bottomCollision = False
        if (bottomCollision and not self.ball.bottomCollision):
            self.ball.yDir *= -1
            self.ball.topCollision = False
            self.ball.bottomCollision = True

    def calculateNewBallDir(self, player):
        self.ball.xDir *= -1
        ballToPlayerDist = self.ball.yPos - player.yPos
        normalizedDist = ballToPlayerDist / player.length
        self.ball.yDir = normalizedDist * 0.6
        self.ball.speed = self.ball.speed + 0.1 if self.ball.speed < 4 else 4

    def checkBallAndPlayerCollision(self, player):
        ballLeftEdge = self.ball.xPos - self.ball.totalRadius
        ballRightEdge = self.ball.xPos + self.ball.totalRadius

        playerTopEdge = player.yPos + (player.length / 2) + 1
        playerBottomEdge = player.yPos - (player.length / 2) - 1
        playerLeftEdge = player.xPos - player.radius
        playerRightEdge = player.xPos + player.radius

        if (self.ball.yPos <= playerTopEdge and self.ball.yPos >= playerBottomEdge):
            if (player.leftPlayer):
                if (
                    ballLeftEdge <= playerRightEdge and
                    ballLeftEdge >= playerLeftEdge and
                    not self.pOne.impact
                ):
                    self.calculateNewBallDir(player)
                    self.pOne.impact = True
                    self.pTwo.impact = False
                    self.ball.topCollision = False
                    self.ball.bottomCollision = False
            else:
                if (
                    ballRightEdge >= playerLeftEdge and
                    ballRightEdge <= playerRightEdge and
                    not self.pTwo.impact
                ):
                    self.calculateNewBallDir(player)
                    self.pOne.impact = False
                    self.pTwo.impact = True
                    self.ball.topCollision = False
                    self.ball.bottomCollision = False

    def playersMovements(self):
        pOneUpMovAllowed = (self.pOne.yPos + 1 + self.pOne.length / 2) < self.table.height
        pOneDownMovAllowed = (self.pOne.yPos - 1 - self.pOne.length / 2) > 0

        if (self.pOne.upMovement and pOneUpMovAllowed):
            self.pOne.yPos += self.pOne.SPEED
        if (self.pOne.downMovement and pOneDownMovAllowed):
            self.pOne.yPos -= self.pOne.SPEED

        pTwoUpMovAllowed = (self.pTwo.yPos + 1 + self.pTwo.length / 2) < self.table.height
        pTwoDownMovAllowed = (self.pTwo.yPos - 1 - self.pTwo.length / 2) > 0

        if (self.pTwo.upMovement and pTwoUpMovAllowed):
            self.pTwo.yPos += self.pTwo.SPEED
        if (self.pTwo.downMovement and pTwoDownMovAllowed):
            self.pTwo.yPos -= self.pTwo.SPEED

    def restartPositions(self):
        self.ball.resetPositions()
        self.pOne.resetPositions()
        self.pTwo.resetPositions()

    async def checkPoint(self):
        pOnePoint = self.ball.xPos >= self.limits.x
        pTwoPoint = self.ball.xPos <= -self.limits.x

        if (pOnePoint or pTwoPoint):
            if (pOnePoint):
                self.score.pOne += 1
            else:
                self.score.pTwo += 1
            self.restartPositions()
            scoreData = {
                "type": "add.point",
                "scoreData": True,
                "pOneId": self.pOne.playerId,
                "pTwoId": self.pTwo.playerId,
                "pOneScore": self.score.pOne,
                "pTwoScore": self.score.pTwo,
                "matchId": self.matchId
            }
            await self.sockets["player1"].send(text_data=json.dumps(scoreData))
            await self.sockets["player2"].send(text_data=json.dumps(scoreData))
    
    async def countdown(self):
        startingGame = {
            "type": "starting.game",
            "startingGame": True,
            "status": "3"
        }
        if (type(self.sockets["player1"]) != 'int'):
            await self.sockets["player1"].send(text_data=json.dumps(startingGame))
        if (type(self.sockets["player2"]) != 'int'):
            await self.sockets["player2"].send(text_data=json.dumps(startingGame))
        await asyncio.sleep(1.5)

        startingGame = {
            "type": "starting.game",
            "startingGame": True,
            "status": "2"
        }
        if (type(self.sockets["player1"]) != 'int'):
            await self.sockets["player1"].send(text_data=json.dumps(startingGame))
        if (type(self.sockets["player2"]) != 'int'):
            await self.sockets["player2"].send(text_data=json.dumps(startingGame))
        await asyncio.sleep(1.5)

        startingGame = {
            "type": "starting.game",
            "startingGame": True,
            "status": "1"
        }
        if (type(self.sockets["player1"]) != 'int'):
            await self.sockets["player1"].send(text_data=json.dumps(startingGame))
        if (type(self.sockets["player2"]) != 'int'):
            await self.sockets["player2"].send(text_data=json.dumps(startingGame))
        await asyncio.sleep(1.5)


    async def runGame(self):
        gameStart = time.time()
        self.calculateRandomBallDir()
        await self.countdown()

        while (self.score.pOne < 11 and self.score.pTwo < 11 and self.disFlags["player1"] == False and self.disFlags["player2"] == False):
            gamePositions = {
                "type": "game.info",
                "gameData": True,
                "pOneId": self.pOne.playerId,
                "pTwoId": self.pTwo.playerId,
                "ballPosX": self.ball.xPos,
                "ballPosY": self.ball.yPos,
                "pOnePosX": self.pOne.xPos,
                "pOnePosY": self.pOne.yPos,
                "pTwoPosX": self.pTwo.xPos,
                "pTwoPosY": self.pTwo.yPos,
                "matchId": self.matchId
            }
            if (type(self.sockets["player1"]) != 'int'):
                await self.sockets["player1"].send(text_data=json.dumps(gamePositions))
            if (type(self.sockets["player2"]) != 'int'):
                await self.sockets["player2"].send(text_data=json.dumps(gamePositions))

            self.checkGameLimitsCollisions()
            self.checkBallAndPlayerCollision(self.pOne)
            self.checkBallAndPlayerCollision(self.pTwo)
            self.playersMovements()
            await self.checkPoint()

            self.ball.xPos += self.ball.xDir * self.ball.speed
            self.ball.yPos += self.ball.yDir * self.ball.speed

            await asyncio.sleep(0.033)

        finishTime = time.time()
        userPlayerOne: PongueUser = await self.getUser(self.pOne.playerId)
        userPlayerTwo: PongueUser = await self.getUser(self.pTwo.playerId)

        if (self.disFlags["player1"] == False and self.disFlags["player2"] == False):
            self.winner = self.pOne.playerId if self.score.pOne > self.score.pTwo else self.pTwo.playerId
            await self.createGameResult(userPlayerOne, userPlayerTwo, self.score.pOne, self.score.pTwo, gameStart, finishTime)
            await self.registerUserStatistics(userPlayerOne, userPlayerTwo, self.winner)

            finishedGame = {
                "type": "game.end",
                "gameEnd": True,
                "pOneId": self.pOne.playerId,
                "pTwoId": self.pTwo.playerId,
                "pOneScore": self.score.pOne,
                "pTwoScore": self.score.pTwo,
                "winner": self.winner,
                "startTime": gameStart,
                "finishTime": finishTime,
                "duration": finishTime - gameStart, 
                "matchId": self.matchId
            }

            if (type(self.sockets["player1"]) != 'int'):
                await self.sockets["player1"].send(text_data=json.dumps(finishedGame))
            if (type(self.sockets["player2"]) != 'int'):
                await self.sockets["player2"].send(text_data=json.dumps(finishedGame))
        else:
            playerOneScore = 0 if self.disFlags["player1"] else 11
            playerTwoScore = 0 if self.disFlags["player2"] else 11
            self.winner = self.pOne.playerId if self.disFlags["player2"] == True else self.pTwo.playerId
            await self.registerUserStatistics(userPlayerOne, userPlayerTwo, self.winner)
            await self.createGameResult(userPlayerOne, userPlayerTwo, playerOneScore, playerTwoScore, gameStart, finishTime)
            await self.disconnection()

    async def disconnection(self):
        data = { "disconnection": "you win" }

        if self.disFlags["player1"] == True:
            await self.sockets["player2"].send(text_data=json.dumps(data))
        elif self.disFlags["player2"] == True:
            await self.sockets["player1"].send(text_data=json.dumps(data))
    
    async def registerUserStatistics(self, userPlayerOne: PongueUser, userPlayerTwo: PongueUser, winner):
        p1: PongueUser = await self.getUser(userPlayerOne.id)
        p2: PongueUser = await self.getUser(userPlayerTwo.id)

        p1.games_played += 1
        p2.games_played += 1

        if (winner == p1.id):
            p1.games_won += 1
            p1.points += 3
            p2.games_lost += 1
        else:
            p2.games_won += 1
            p2.points += 3
            p1.games_lost += 1

        await self.saveUserChanges(p1)
        await self.saveUserChanges(p2)
    
    @database_sync_to_async
    def getUser(self, userId):
        close_old_connections()
        return PongueUser.objects.get(id=userId)
    
    @database_sync_to_async
    def saveUserChanges(self, user: PongueUser):
        close_old_connections()
        print(f"user: {user.games_won}, {user.games_lost}, {user.points}")
        user.save()

    @database_sync_to_async
    def createGameResult(self, playerOne: PongueUser, playerTwo: PongueUser, playerOneScore, playerTwoScore, gameStart, finishTime):
        close_old_connections()
        GameResults.objects.create(
            player_1=playerOne,
            player_2=playerTwo,
            player_1_score=playerOneScore,
            player_2_score=playerTwoScore,
            created_at=gameStart,
            updated_at=finishTime
        )
