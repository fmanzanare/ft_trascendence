import random

class Game:
    ready = False
    ballPosition = {
        "x": 0,
        "y": 0
    }
    ballDir = {
        "x": 0,
        "y": 0
    }
    pOnePosition = {
        "x": 0,
        "y": 0
    }
    pOneMovement = {
        "up": False,
        "down": False
    }
    pTwoPosition = {
        "x": 0,
        "y": 0
    }
    pTwoMovement = {
        "up": False,
        "down": False
    }
    score = {
        "pOne": 0,
        "pTwo": 0
    }
    PLAYERS_SPEED = 1
    ballSpeed = 1.2

    def calculateRandomBallDir(self):
        initDirX = -1 if random.random() < 0.5 else 1
        initDirY = -1 if random.random() < 0.5 else 1
        rand = random.random()
        self.ballDir["x"] = 0.5 * initDirX
        self.ballDir["y"] = (0.6 if rand > 0.6 else rand) * initDirY