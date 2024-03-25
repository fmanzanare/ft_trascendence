import random, json, asyncio

class Game:
    game_instance = None
    ready = False
    hostId = -1
    ballPosition = {
        "x": 0,
        "y": 0,
        "leftEdge": 0,
        "rightEdge":0
    }
    ballDir = {
        "x": 0,
        "y": 0
    }
    socket = None
    pOnePosition = {
        "x": 0,
        "y": 0,
        "rightEdge": 0,
        "topEdge": 0,
        "bottomEdge": 0
    }
    pOneMovement = {
        "up": False,
        "down": False
    }
    pTwoPosition = {
        "x": 0,
        "y": 0,
        "leftEdge": 0,
        "topEdge": 0,
        "bottomEdge": 0
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
    ballSpeed = 0.4

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
        if (self.pOneMovement["down"] and pOneBottomLimit):
            self.pOnePosition["y"] -= self.PLAYERS_SPEED

        pTwoTopLimit = self.pTwoPosition["topEdge"] < self.limits["y"]
        pTwoBottomLimit = self.pTwoPosition["bottomEdge"] > 0

        if (self.pTwoMovement["up"] and pTwoTopLimit):
            self.pTwoPosition["y"] += self.PLAYERS_SPEED
        if (self.pTwoMovement["down"] and pTwoBottomLimit):
            self.pTwoPosition["y"] -= self.PLAYERS_SPEED


    async def runGame(self):
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

            self.playersMovement()

            self.ballPosition["x"] += self.ballDir["x"] * self.ballSpeed
            self.ballPosition["y"] += self.ballDir["y"] * self.ballSpeed

            await asyncio.sleep(0.016666666)