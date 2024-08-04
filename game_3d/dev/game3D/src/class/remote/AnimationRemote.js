
export class AnimationLoopRemote {

	ballSpeed = 1.2
	started = false
	ballDir = {
		x: 0,
		y: 0
	}
	initialDir = {
		x: 0,
		y: 0
	}
	limits = {
		x: 0,
		y: 0
	}

	pOneMovement = {
		up: false,
		down: false
	};
	pTwoMovement = {
		up: false,
		down: false
	};
	playersSpeed = 1;

	table = null
	ball = null
	pOne = null
	pTwo = null
	score = null

	renderer = null
	scene = null
	camera = null

    socket = null
    host = false
    userId = -1

    constructor(socket, host, userId, table, ball, pOne, pTwo, score, renderer, scene, camera) {
        this.table = table;
        this.ball = ball;
        this.pOne = pOne;
        this.pTwo = pTwo;
        this.score = score;
        this.renderer = renderer,
        this.scene = scene;
        this.camera = camera;

        this.limits.x = this.table.width / 2 + this.ball.totalRadius;
        this.limits.y = this.table.height + this.ball.totalRadius;

        this.socket = socket;
        this.host = host;
        this.userId = userId;
    }

    getBallDirFromReceivedData(data) {
        if (data.ballDir) {
            this.ballDir.x = data.ballDirX;
            if (!this.host) {
                this.ballDir.x *= -1;
            }
            this.ballDir.y = data.ballDirY;
        }
    }

    updatePlayerPosWithReceivedData(data) {
        if (data.userId != null && data.userId != this.userId) {
            this.pTwo.getPlayer().position.y = data.posY
        }
    }

	updateBallPositionAfterImpact(data) {
        if (data.userId != null && data.userId != this.userId) {
			this.ball.getBall().position.x = data.ballPosX * -1;
			this.ball.getBall().position.y = data.ballPosY;
			console.log(data)
		}
	}

    playersMovement() {
		let pOneTopLimit = (this.pOne.getPlayer().position.y + 1 + this.pOne.length / 2) < this.table.height;
		let pOneBottomLimit = (this.pOne.getPlayer().position.y - 1 - this.pOne.length / 2) > 0;

		if (this.pOneMovement.up && pOneTopLimit) {
			this.pOne.getPlayer().position.y += this.playersSpeed;
            this.socket.send(JSON.stringify({
                'gameData': true,
                'playerPos': true,
                'userId': this.userId,
                'posY': this.pOne.getPlayer().position.y
            }))
		}
		if (this.pOneMovement.down && pOneBottomLimit) {
			this.pOne.getPlayer().position.y -= this.playersSpeed;
            this.socket.send(JSON.stringify({
                'gameData': true,
                'playerPos': true,
                'userId': this.userId,
                'posY': this.pOne.getPlayer().position.y
            }))
		}
    }

    restartPositions() {
        // DEBUG SOLUTION!!
        this.ball.getBall().position.x = 0;
        this.ball.getBall().position.y = this.ball.yPos;
        this.pOne.getPlayer().position.y = this.pOne.yPos;
        this.pTwo.getPlayer().position.y = this.pTwo.yPos;
		this.ballSpeed = 1.2;
		this.pOne.impact = false;
		this.pTwo.impact = false;
		this.score.redrawScore();
    }

	checkPoint() {
		if (this.ball.getBall().position.x >= this.limits.x) {
			this.score.addPOnePoint();
			this.restartPositions();
		} else if (this.ball.getBall().position.x <= -this.limits.x) {
			this.score.addPTwoPoint();
			this.restartPositions();
		}
	}

	calculateNewBallDir(ballYPos, playerYPos, playerLength) {
		this.ballDir.x *= -1;
		let ballToPlayerDist = ballYPos - playerYPos;
		let normalizedDist = ballToPlayerDist / playerLength;
		this.ballDir.y = normalizedDist * 0.6;
		this.ballSpeed = (this.ballSpeed < 4) ? this.ballSpeed + 0.1 : 4;
	}

	checkBallAndPlayerCollision(player) {
		let ballLeftEdge = this.ball.getBall().position.x - this.ball.totalRadius
		let ballRightEdge = this.ball.getBall().position.x + this.ball.totalRadius
		let ballYPos = this.ball.getBall().position.y;

		let playerLeftEdge = player.getPlayer().position.x - player.radius;
		let playerRightEdge = player.getPlayer().position.x + player.radius;
		let playerTopEdge = player.getPlayer().position.y + (player.length / 2) + 1;
		let playerBottomEdge = player.getPlayer().position.y - (player.length / 2) - 1;
		let playerYPos = player.getPlayer().position.y

		if (ballYPos <= playerTopEdge && ballYPos >= playerBottomEdge) {
			if (player.leftPlayer) {
				if (ballLeftEdge <= playerRightEdge &&
					ballLeftEdge >= playerLeftEdge &&
					!this.pOne.impact
				) {
					this.calculateNewBallDir(ballYPos, playerYPos, this.pOne.length);
					this.pOne.impact = true;
					this.pTwo.impact = false;
					this.socket.send(JSON.stringify({
						'gameData': true,
						'impact': true,
						'userId': this.userId,
						'ballPosX': this.ball.getBall().position.x,
						'ballPosY': this.ball.getBall().position.y
					}))
				}
			} else {
				if (ballRightEdge >= playerLeftEdge &&
					ballRightEdge <= playerRightEdge &&
					!this.pTwo.impact
				) {
					this.calculateNewBallDir(ballYPos, playerYPos, this.pTwo.length);
					this.pOne.impact = false;
					this.pTwo.impact = true;
				}
			}
		}
	}

	checkGameLimitsCollision() {
		let topCollision = this.ball.getBall().position.y >= this.limits.y;
		let bottomCollision = this.ball.getBall().position.y <= 0;

		if (topCollision || bottomCollision) {
			this.ballDir.y *= -1;
		}
	}

	checkCollisions() {
		this.checkBallAndPlayerCollision(this.pOne);
		this.checkBallAndPlayerCollision(this.pTwo);

		this.checkGameLimitsCollision();
	}

    animate() {
        this.checkPoint();
        this.checkCollisions();
        this.playersMovement();

        this.ball.getBall().position.x += this.ballDir.x * this.ballSpeed;
        this.ball.getBall().position.y += this.ballDir.y * this.ballSpeed;

        this.renderer.getRenderer().render(this.scene, this.camera.getCamera());
    }

}