
export class AnimationLoop {

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

	constructor(table, ball, pOne, pTwo, score, renderer, scene, camera) {
		this.table = table;
		this.ball = ball;
		this.pOne = pOne;
		this.pTwo = pTwo;
		this.score = score;
		this.renderer = renderer;
		this.scene = scene;
		this.camera = camera;

		this.limits.x = this.table.width / 2 + this.ball.totalRadius;
		this.limits.y = this.table.height - this.ball.totalRadius;
	}

	getInitialDir() {
		this.initialDir.x = Math.random() < 0.5 ? -1 : 1;
		this.initialDir.y = Math.random() < 0.5 ? -1 : 1;
	}

	getBallDir() {
		this.ballDir.x = 0.5 * this.initialDir.x;
		let rand = Math.random();
		this.ballDir.y = (rand > 0.6 ? 0.6 : rand) * this.initialDir.y;
	}

	// ANIMATED GAME FUNCTIONS
	initGame() {
		if (!this.started) {
			this.getInitialDir();
			this.getBallDir();
			this.started = true;
		}
	}

	restartPositions() {
		this.started = false;
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

	playersMovements() {
		let pOneTopLimit = (this.pOne.getPlayer().position.y + 1 + this.pOne.length / 2) < this.table.height;
		let pOneBottomLimit = (this.pOne.getPlayer().position.y - 1 - this.pOne.length / 2) > 0;
		let pTwoTopLimit = (this.pTwo.getPlayer().position.y + 1 + this.pTwo.length / 2) < this.table.height;
		let pTwoBottomLimit = (this.pTwo.getPlayer().position.y - 1 - this.pTwo.length / 2) > 0;

		if (this.pOneMovement.up && pOneTopLimit) {
			this.pOne.getPlayer().position.y += this.playersSpeed;
		}
		if (this.pOneMovement.down && pOneBottomLimit) {
			this.pOne.getPlayer().position.y -= this.playersSpeed;
		}
		if (this.pTwoMovement.up && pTwoTopLimit) {
			this.pTwo.getPlayer().position.y += this.playersSpeed;
		}
		if (this.pTwoMovement.down && pTwoBottomLimit) {
			this.pTwo.getPlayer().position.y -= this.playersSpeed;
		}
	}

	animate() {
		this.initGame()
		this.checkPoint();
		this.checkCollisions();

		this.ball.getBall().position.x += this.ballDir.x * this.ballSpeed;
		this.ball.getBall().position.y += this.ballDir.y * this.ballSpeed;

		this.playersMovements();

		if (this.score.pOneScore == 11 || this.score.pTwoScore == 11) {
			this.renderer.getRenderer().setAnimationLoop(null);
			if (this.score.pOneScore == 11) {
				return 1;
			}
			return 2;
		}

		this.renderer.getRenderer().render(this.scene, this.camera.getCamera());
	}


}
