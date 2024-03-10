import * as THREE from 'three'

export class Animation {

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

	table = null
	ball = null
	pOne = null
	pTwo = null
	score = null

	constructor(table, ball, pOne, pTwo, score) {
		this.table = table;
		this.ball = ball;
		this.pOne = pOne;
		this.pTwo = pTwo;
		this.score = score;

		this.limits.x = this.table.height - this.ball.totalRadius;
		this.limits.y = this.table.width / 2 + this.ball.totalRadius;
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

	// ANIMATED GAME FUNCTIONS!!
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
		this.ball.getBall().position.y = 0;
		pOne.getPlayer().position.y = this.player.yPos;
		pTwo.getPlayer().position.y = this.player.yPos;
		ballSpeed = 1.2;
		this.pOne.impact = false;
		this.pTwo.impact = false;
		score.redrawScore();
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

	calculateNewBallDir(ballYPos, playerYPos) {
		this.ballDir.x *= -1;
		let ballToPlayerDist = ballYPos - playerYPos;
		let normalizedDist = ballToPlayerDist / player.length;
		this.ballDir.y = normalizedDist * 0.6;
		this.ballSpeed = (this.ballSpeed < 4) ? this.ballSpeed + 0.1 : 4;
	}

	checkBallAndPlayerCollision(player) {
		let ballLeftEdge = this.ball.getBall().position.x - this.ball.totalRadius
		let ballRightEdge = this.ball.getBall().position.x + this.ball.totalRadius
		let ballYPos = this.ball.getBall().position.y;

		let playerLeftEdge = player.getPlayer().position.x + player.radius;
		let playerRightEdge = player.getPlayer().position.x - player.radius;
		let playerTopEdge = player.getPlayer().position.y + (player.length / 2) + 1;
		let playerBottomEdge = player.getPlayer().position.y - (player.length / 2) - 1;
		let playerYPos = player.getPlayer().position.y

		if (ballYPos <= playerTopEdge && ballYPos >= playerBottomEdge) {
			if (player.leftPlayer) {
				if (ballLeftEdge <= playerRightEdge &&
					ballRightEdge >= playerLeftEdge &&
					!this.pOne.impact
				) {
					this.calculateNewBallDir(ballYPos, playerYPos);
					this.pOne.impact = true;
					this.pTwo.impact = false;
				}
			} else {
				if (ballRightEdge >= playerLeftEdge &&
					ballRightEdge <= playerRightEdge &&
					!this.pTwo.impact
				) {
					this.calculateNewBallDir(ballYPos, playerYPos);
					this.pOne.impact = false;
					this.pTwo.impact = true;
				}
			}
		}
	}

	checkGameLimitsCollision() {
		// # TODO!
	}

	checkCollisions() {
		this.checkBallAndPlayerCollision(this.pOne);
		this.checkBallAndPlayerCollision(this.pTwo);

		// # TODO!
	}

	animate() {
		this.initGame();
		this.checkPoint();

	}

}
