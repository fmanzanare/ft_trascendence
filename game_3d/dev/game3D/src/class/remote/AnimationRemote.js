import * as THREE from 'three'

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
        this.socket.onmessage = null;
        this.socket.onmessage = this.receiveDataFromWSocket
    }

    // NOT WORKING AT ALL!!!!!!!!!
    receiveDataFromWSocket(e) {
        console.log("Hola")
        const data = JSON.parse(e.data)

        if (data.userId != null && data.userId != this.userId) {
            this.pTwo.getPlayer().position.y = data.posY
        }
        console.log(data)
    }

    playersMovement() {
		let pOneTopLimit = (this.pOne.getPlayer().position.y + 1 + this.pOne.length / 2) < this.table.height;
		let pOneBottomLimit = (this.pOne.getPlayer().position.y - 1 - this.pOne.length / 2) > 0;

		if (this.pOneMovement.up && pOneTopLimit) {
			this.pOne.getPlayer().position.y += this.playersSpeed;
            this.socket.send(JSON.stringify({
                'gameData': true,
                'userId': this.userId,
                'posY': this.pOne.getPlayer().position.y
            }))
		}
		if (this.pOneMovement.down && pOneBottomLimit) {
			this.pOne.getPlayer().position.y -= this.playersSpeed;
            this.socket.send(JSON.stringify({
                'gameData': true,
                'userId': this.userId,
                'posY': this.pOne.getPlayer().position.y
            }))
		}
    }

    animate() {
        // TODO
        this.playersMovement();
        this.renderer.getRenderer().render(this.scene, this.camera.getCamera());
    }

}