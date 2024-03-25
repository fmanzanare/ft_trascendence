import random, json, asyncio

class Game:
    ready = False
    hostId = -1
    initialPositions = {
        "ballPosX": 0,
        "ballPosY": 0,
        "ballLeftEdge": 0,
        "ballRightEdge": 0,
        "pOnePosY": 0,
        "pOneTopEdge": 0,
        "pOneBottomEdge": 0,
        "pTwoPosY": 0,
        "pTwoTopEdge": 0,
        "pTwoBottomEdge": 0
    }
    ballPosition = {
        "x": 0,
        "y": 0,
        "leftEdge": 0,
        "rightEdge": 0
    }
    ballDir = {
        "x": 0,
        "y": 0
    }
    socket = None
    pOnePosition = {
        "x": 0,
        "y": 0,
        "leftEdge": 0,
        "rightEdge": 0,
        "topEdge": 0,
        "bottomEdge": 0,
        "impact": False
    }
    pOneMovement = {
        "up": False,
        "down": False
    }
    pTwoPosition = {
        "x": 0,
        "y": 0,
        "leftEdge": 0,
        "rightEdge": 0,
        "topEdge": 0,
        "bottomEdge": 0,
        "impact": False
    }
    pTwoMovement = {
        "up": False,
        "down": False
    }
    limits = {
        "x": 0,
        "y": 0
    }
    score = {
        "pOne": 0,
        "pTwo": 0
    }
    PLAYERS_SPEED = 0.5
    ballSpeed = 0.6

    def saveInitialPositions(self):
        self.initialPositions["ballPosX"] = self.ballPosition["x"]
        self.initialPositions["ballPosY"] = self.ballPosition["y"]
        self.initialPositions["ballLeftEdge"] = self.ballPosition["leftEdge"]
        self.initialPositions["ballRightEdge"] = self.ballPosition["rightEdge"]

        self.initialPositions["pOnePosY"] = self.pOnePosition["y"]
        self.initialPositions["pOneTopEdge"] = self.pOnePosition["topEdge"]
        self.initialPositions["pOneBottomEdge"] = self.pOnePosition["bottomEdge"]

        self.initialPositions["pTwoPosY"] = self.pTwoPosition["y"]
        self.initialPositions["pTwoTopEdge"] = self.pTwoPosition["topEdge"]
        self.initialPositions["pTwoBottomEdge"] = self.pTwoPosition["bottomEdge"]

    def calculateRandomBallDir(self):
        initDirX = -1 if random.random() < 0.5 else 1
        initDirY = -1 if random.random() < 0.5 else 1
        rand = random.random()
        self.ballDir["x"] = 0.5 * initDirX
        self.ballDir["y"] = (0.6 if rand > 0.6 else rand) * initDirY

    def playersMovement(self):
        pOneTopLimit = self.pOnePosition["topEdge"] < self.limits["y"]
        pOneBottomLimit = self.pOnePosition["bottomEdge"] > 0

        if (self.pOneMovement["up"] and pOneTopLimit):
            self.pOnePosition["y"] += self.PLAYERS_SPEED
            self.pOnePosition["topEdge"] += self.PLAYERS_SPEED
            self.pOnePosition["bottomEdge"] += self.PLAYERS_SPEED
        if (self.pOneMovement["down"] and pOneBottomLimit):
            self.pOnePosition["y"] -= self.PLAYERS_SPEED
            self.pOnePosition["topEdge"] -= self.PLAYERS_SPEED
            self.pOnePosition["bottomEdge"] -= self.PLAYERS_SPEED

        pTwoTopLimit = self.pTwoPosition["topEdge"] < self.limits["y"]
        pTwoBottomLimit = self.pTwoPosition["bottomEdge"] > 0

        if (self.pTwoMovement["up"] and pTwoTopLimit):
            self.pTwoPosition["y"] += self.PLAYERS_SPEED
            self.pTwoPosition["topEdge"] += self.PLAYERS_SPEED
            self.pTwoPosition["bottomEdge"] += self.PLAYERS_SPEED
        if (self.pTwoMovement["down"] and pTwoBottomLimit):
            self.pTwoPosition["y"] -= self.PLAYERS_SPEED
            self.pTwoPosition["topEdge"] -= self.PLAYERS_SPEED
            self.pTwoPosition["bottomEdge"] -= self.PLAYERS_SPEED

    def checkGameLimitCollisions(self):
        topCollision = self.ballPosition["y"] >= self.limits["y"]
        bottomCollision = self.ballPosition["y"] <= 0

        if (topCollision or bottomCollision):
            self.ballDir["y"] *= -1

    def ballDirAfterCollisionWithPlayer(self, player):
        self.ballDir["x"] *= -1
        ballToPlayerDist = self.ballPosition["y"] - player["y"]
        normalizedDist = ballToPlayerDist / (player["topEdge"]- player["bottomEdge"])
        self.ballDir["y"] = normalizedDist * 0.6
        self.ballSpeed = self.ballSpeed + 0.05 if self.ballSpeed < 3 else 3

    def checkBallAndPlayerCollision(self):
        if (
            self.ballPosition["y"] <= self.pOnePosition["topEdge"] and
            self.ballPosition["y"] >= self.pOnePosition["bottomEdge"] and
            self.ballPosition["leftEdge"] <= self.pOnePosition["rightEdge"] and
            self.ballPosition["leftEdge"] >= self.pOnePosition["leftEdge"] and
            not self.pOnePosition["impact"]
        ):
            self.ballDirAfterCollisionWithPlayer(self.pOnePosition)
            self.pOnePosition["impact"] = True
            self.pTwoPosition["impact"] = False

        if (
            self.ballPosition["y"] <= self.pTwoPosition["topEdge"] and
            self.ballPosition["y"] >= self.pTwoPosition["bottomEdge"] and
            self.ballPosition["rightEdge"] >= self.pTwoPosition["leftEdge"] and
            self.ballPosition["rightEdge"] <= self.pTwoPosition["rightEdge"] and
            not self.pTwoPosition["impact"]
        ):
            self.ballDirAfterCollisionWithPlayer(self.pTwoPosition)
            self.pTwoPosition["impact"] = True
            self.pOnePosition["impact"] = False
        
    def restartPositions(self):
        self.calculateRandomBallDir()
        self.ballPosition["x"] = self.initialPositions["ballPosX"]
        self.ballPosition["y"] = self.initialPositions["ballPosY"]
        self.ballPosition["leftEdge"] = self.initialPositions["ballLeftEdge"]
        self.ballPosition["rightEdge"] = self.initialPositions["ballRightEdge"]
        self.pOnePosition["y"] = self.initialPositions["pOnePosY"]
        self.pOnePosition["topEdge"] = self.initialPositions["pOneTopEdge"]
        self.pOnePosition["bottomEdge"] = self.initialPositions["pOneBottomEdge"]
        self.pOnePosition["impact"] = False
        self.pTwoPosition["y"] = self.initialPositions["pTwoPosY"]
        self.pTwoPosition["topEdge"] = self.initialPositions["pTwoTopEdge"]
        self.pTwoPosition["bottomEdge"] = self.initialPositions["pTwoBottomEdge"]
        self.pTwoPosition["impact"] = False
        self.ballSpeed = 0.6

    async def checkPoint(self):
        if (self.ballPosition["x"] >= self.limits["x"]):
            self.score["pOne"] += 1
            self.restartPositions()
            scoreData = {
                "type": "game.info",
				"scoreData": True,
                "hostId": self.hostId,
                "pOneScore": self.score["pOne"],
                "pTwoScore": self.score["pTwo"]
            }
            await self.socket.channel_layer.group_send(
				self.socket.room_group_name, scoreData
			)
        if (self.ballPosition["x"] <= -self.limits["x"]):
            self.score["pTwo"] += 1
            self.restartPositions()
            scoreData = {
                "type": "game.info",
				"scoreData": True,
                "hostId": self.hostId,
                "pOneScore": self.score["pOne"],
                "pTwoScore": self.score["pTwo"]
            }
            await self.socket.channel_layer.group_send(
				self.socket.room_group_name, scoreData
			)

    async def runGame(self):
        self.saveInitialPositions()
        self.calculateRandomBallDir()
        while (self.score["pOne"] < 11 and self.score["pTwo"] < 11):
            gamePositions = {
                "type": "game.info",
				"gameData": True,
                "hostId": self.hostId,
                "ballPosX": self.ballPosition["x"],
                "ballPosY": self.ballPosition["y"],
                "pOnePosX": self.pOnePosition["x"],
                "pOnePosY": self.pOnePosition["y"],
                "pTwoPosX": self.pTwoPosition["x"],
                "pTwoPosY": self.pTwoPosition["y"]
            }
            await self.socket.channel_layer.group_send(
				self.socket.room_group_name, gamePositions 
			)

            self.checkGameLimitCollisions()
            self.checkBallAndPlayerCollision()
            self.playersMovement()
            await self.checkPoint()

            self.ballPosition["x"] += self.ballDir["x"] * self.ballSpeed
            self.ballPosition["y"] += self.ballDir["y"] * self.ballSpeed
            self.ballPosition["leftEdge"] += self.ballDir["x"] * self.ballSpeed
            self.ballPosition["rightEdge"] += self.ballDir["x"] * self.ballSpeed

            await asyncio.sleep(0.03)