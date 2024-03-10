import * as THREE from 'three'
import { Table } from './Table'

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
		this.ball.getBall().position.y = 0;
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
		if (this.pOneMovement.up) {
			this.pOne.getPlayer().position.y += this.playersSpeed;
		}
		if (this.pOneMovement.down) {
			this.pOne.getPlayer().position.y -= this.playersSpeed;
		}
		if (this.pTwoMovement.up) {
			this.pTwo.getPlayer().position.y += this.playersSpeed;
		}
		if (this.pTwoMovement.down) {
			this.pTwo.getPlayer().position.y -= this.playersSpeed;
		}
	}

	animate() {
		this.initGame();
		this.checkPoint();
		this.checkCollisions();

		this.ball.getBall().position.x += this.ballDir.x * this.ballSpeed;
		this.ball.getBall().position.y += this.ballDir.y * this.ballSpeed;

		this.playersMovements();

		this.renderer.getRenderer().render(this.scene, this.camera.getCamera());
	}


}
