
class Sizes:
    width = 1920
    height = 1080

class Ball:
    __defaultYPos = ((Sizes.height / 2) * 0.12 / 2)

    def __init__(self):
        self.totalRadius = 1.5
        self.yPos = self.__defaultYPos
        self.xPos = 0
        self.speed = 1.2
        self.xDir = 0
        self.yDir = 0
        self.topCollision = False
        self.bottomCollision = False
    
    def resetPositions(self):
        self.yPos = self.__defaultYPos
        self.xPos = 0
        self.speed = 1.2
        self.topCollision = False
        self.bottomCollision = False

class Player:
    __defaultYPos = ((Sizes.height / 2) * 0.12) / 2
    __defaultXPos = (((Sizes.width / 2) * 0.11) / 2) - 5

    def __init__(self, leftPlayer, playerId):
        self.radius = 1.2
        self.length = ((Sizes.height / 2) * 0.12) * 0.2
        self.leftPlayer = leftPlayer
        self.yPos = self.__defaultYPos
        self.xPos = self.__defaultXPos if not self.leftPlayer else self.__defaultXPos * -1
        self.impact = False
        self.playerId = playerId
        self.SPEED = 0.7
        self.upMovement = False
        self.downMovement = False
    
    def resetPositions(self):
        self.yPos = self.__defaultYPos
        self.impact = False
        self.upMovement = False
        self.downMovement = False

    def setUpMovement(self, upMovement):
        self.upMovement = upMovement

    def setDownMovement(self, downMovement):
        self.downMovement = downMovement


class Table:
    def __init__(self):
        self.width = (Sizes.width / 2) * 0.11
        self.height = (Sizes.height / 2) * 0.12
        self.yPos = self.height / 2
    
class Limits:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def setX(self, newValue):
        self.x = newValue

    def setY(self, newValue):
        self.x = newValue

class Score:
    def __init__(self):
        self.pOne = 0
        self.pTwo = 0