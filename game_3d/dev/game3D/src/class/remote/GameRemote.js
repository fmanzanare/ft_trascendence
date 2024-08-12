import * as THREE from '../../three/build/three.module.js';
import { Table } from '../Table.js';
import { Ball } from "../Ball.js";
import { Player } from "../Player.js";
import { Renderer } from "../Renderer.js";
import { Score } from "../Score.js";
import { Spotlight } from "../Spotlight.js"
import { Camera } from '../Camera.js';
import { GameSizes } from '../Sizes.js';
import { PlayersNames } from '../PlayersNames.js';
import { Countdown } from '../Countdown.js';

export class GameRemote {

    sizes = new GameSizes(true)
    container = document.getElementById('gameDiv');
	scene = new THREE.Scene();
	renderer = new Renderer(this.sizes);
	camera = new Camera(this.sizes);
	spotLight = new Spotlight(this.scene, this.sizes);
    pOneNameSpotLight = new Spotlight(this.scene, this.sizes);
    pTwoNameSpotLight = new Spotlight(this.scene, this.sizes);
	table = new Table(this.scene, this.sizes);
	playerOne = new Player(true, this.scene, this.sizes);
	playerTwo = new Player(false, this.scene, this.sizes);
	ball = new Ball(this.scene, this.sizes);
    countdown = new Countdown(this.scene, this.sizes);
	score = new Score(this.scene);
    names = new PlayersNames(this.scene, '', '');
	animation = null;

	limits = {
		x: this.table.width / 2 + this.ball.totalRadius,
		y: this.table.height + this.ball.totalRadius
	}
	speed = 4;

    userId = -1;
    host = false;
    socket = null;

    constructor(socket, userId, host) {
		this.scene.background = new THREE.Color(0x1e1e1e);
        this.spotLight.addSpotLightToScene();
		this.spotLight.addTargetToSpotLight(this.table.getTable());
        this.pOneNameSpotLight.setNewPos(-90, 100, 20)
        this.pOneNameSpotLight.addSpotLightToScene()
		this.pOneNameSpotLight.addTargetToSpotLight(this.table.getTable());
        this.pTwoNameSpotLight.setNewPos(90, 100, 20)
        this.pTwoNameSpotLight.addSpotLightToScene()
		this.pTwoNameSpotLight.addTargetToSpotLight(this.table.getTable());
        this.socket = socket;
        this.userId = userId;
        this.host = host;
    }

    addGameToDOM() {
        this.container.parentElement.appendChild(this.renderer.getRenderer().domElement)
    }

    keyDownMovements(event) {
		if (event.key == "W" || event.key == "w") {
            this.socket.send(JSON.stringify({
                "playerMovement": true,
                "movementDir": 1,
                "userId": this.userId
            }))
		}
		if (event.key == "S" || event.key == "s") {
            this.socket.send(JSON.stringify({
                "playerMovement": true,
                "movementDir": -1,
                "userId": this.userId
            }))
		}
    }

    keyReleaseMovements(event) {
		if (event.key == "W" || event.key == "w") {
            this.socket.send(JSON.stringify({
                "playerMovement": false,
                "movementDir": 1,
                "userId": this.userId
            }))
		}
		if (event.key == "S" || event.key == "s") {
            this.socket.send(JSON.stringify({
                "playerMovement": false,
                "movementDir": -1,
                "userId": this.userId
            }))
		}
    }

    startRemoteGame() {
        this.names.redrawNames();

        this.socket.send(JSON.stringify({
            "buildGame": true,
            "userId": this.userId,
            "limitX": this.limits.x,
            "limitY": this.limits.y,
            "ballPosX": this.ball.getBall().position.x,
            "ballPosY": this.ball.getBall().position.y,
            "ballLeftEdge": this.ball.getBall().position.x - this.ball.totalRadius,
            "ballRightEdge": this.ball.getBall().position.x + this.ball.totalRadius,
            "pOnePosX": this.playerOne.getPlayer().position.x,
            "pOnePosY": this.playerOne.getPlayer().position.y,
            "pOneRightEdge": this.playerOne.getPlayer().position.x + this.playerOne.radius,
            "pOneLeftEdge": this.playerOne.getPlayer().position.x - this.playerOne.radius,
            "pOneTopEdge": this.playerOne.getPlayer().position.y + (this.playerOne.length / 2) + 1,
            "pOneBottomEdge": this.playerOne.getPlayer().position.y - (this.playerOne.length / 2) - 1,
            "pTwoPosX": this.playerTwo.getPlayer().position.x,
            "pTwoPosY": this.playerTwo.getPlayer().position.y,
            "pTwoRightEdge": this.playerTwo.getPlayer().position.x + this.playerTwo.radius,
            "pTwoLeftEdge": this.playerTwo.getPlayer().position.x - this.playerTwo.radius,
            "pTwoTopEdge": this.playerTwo.getPlayer().position.y + (this.playerTwo.length / 2) + 1,
            "pTwoBottomEdge": this.playerTwo.getPlayer().position.y - (this.playerTwo.length / 2) - 1,
        }))
        this.addGameToDOM();

        this.renderer.getRenderer().setAnimationLoop( () => {
            this.renderer.getRenderer().render(this.scene, this.camera.getCamera());
        })

		window.addEventListener('keydown', (e) => {
            this.keyDownMovements(e);
		});
		window.addEventListener('keyup', (e) => {
			this.keyReleaseMovements(e);
		});
    }

    getReceivedDataFromWS(data) {
        if (data.gameData) {
            if (this.countdown.onScene) {
                this.countdown.deleteCountdown();
            }
            if (!this.ball.onScene && !this.countdown.onScene) {
                this.ball.addBallToScene();
            }
            this.ball.getBall().position.x = data.ballPosX;
            this.ball.getBall().position.y = data.ballPosY;
            this.playerOne.getPlayer().position.x = data.pOnePosX;
            this.playerOne.getPlayer().position.y = data.pOnePosY;
            this.playerTwo.getPlayer().position.x = data.pTwoPosX;
            this.playerTwo.getPlayer().position.y = data.pTwoPosY;
        }
        if (data.scoreData) {
            this.score.pOneScore = data.pOneScore
            this.score.pTwoScore = data.pTwoScore
            this.score.redrawScore()
        }
    }

    drawCountdown(data) {
        if (data.status != null) {
            if (this.ball.onScene) {
                this.ball.removeBallFromScene();
            }
            this.countdown.countdown = data.status;
            this.countdown.redrawCountdown();
        }
    }

}