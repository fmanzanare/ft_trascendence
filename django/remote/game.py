import random, json, asyncio, time
from .game_classes import *
from pongue.models import PongueUser, GameResults
from pongue.views import jwt_required, get_user_from_jwt

class Game:
    def __init__(self, socket, pOneId, pTwoId):
        self.table = Table()
        self.ball = Ball()
        self.limits = Limits(x=self.table.width / 2 + self.ball.totalRadius, y=self.table.height + self.ball.totalRadius)
        self.pOne = Player(leftPlayer=True, playerId=pOneId)
        self.pTwo = Player(leftPlayer=False, playerId=pTwoId)
        self.score = Score()
        self.socket = socket
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
                "pOneId": self.pOne.playerId,
                "pTwoId": self.pTwo.playerId,
                "pOneScore": self.score.pOne,
                "pTwoScore": self.score.pTwo,
                "matchId": self.matchId
            }
            await self.socket.channel_layer.group_send(
                self.socket.room_group_name, scoreData
            )


    async def runGame(self):
        gameStart = time.time()
        self.calculateRandomBallDir()

        while (self.score.pOne < 11 and self.score.pTwo < 11):
            gamePositions = {
                "type": "game.info",
                "gameData": True,
                "pOneId": self.pOne.playerId,
                "pTwoId": self.pTwo.playerId,
                "ballX": self.ball.xPos,
                "ballY": self.ball.yPos,
                "pOneY": self.pOne.yPos,
                "pTwoY": self.pTwo.yPos,
                "matchId": self.matchId
            }
            await self.socket.channel_layer.group_send(
                self.socket.room_group_name, gamePositions
            )

            self.checkGameLimitsCollisions()
            self.checkBallAndPlayerCollision(self.pOne)
            self.checkBallAndPlayerCollision(self.pTwo)
            self.playersMovements()
            await self.checkPoint()

            self.ball.xPos += self.ball.xDir * self.ball.speed
            self.ball.yPos += self.ball.yDir * self.ball.speed

            await asyncio.sleep(0.033)

        self.winner = self.pOne.playerId if self.score.pOne > self.score.pTwo else self.pTwo.playerId
        finishTime = time.time()
        finishedGame = {
                "type": "game.end",
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

        await self.socket.channel_layer.group_send(
            self.socket.room_group_name, finishedGame
        )
