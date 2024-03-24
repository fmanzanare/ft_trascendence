import * as THREE from 'three';
import { Table } from '../Table';
import { Ball } from "../Ball";
import { Player } from "../Player";
import { Renderer } from "../Renderer";
import { Score } from "../Score";
import { Spotlight } from "../Spotlight"
import { Camera } from '../Camera';
import { AnimationLoopRemote } from './AnimationRemote';
import { GameSizes } from '../Sizes';

export class GameRemote {

    sizes = new GameSizes(true)
    container = document.getElementById('gameDiv');
	scene = new THREE.Scene();
	renderer = new Renderer(this.sizes);
	camera = new Camera(this.sizes);
	spotLight = new Spotlight(this.scene, this.sizes);
	table = new Table(this.scene, this.sizes);
	playerOne = new Player(true, this.scene, this.sizes);
	playerTwo = new Player(false, this.scene, this.sizes);
	ball = new Ball(this.scene, this.sizes);
	score = new Score(this.scene);
	animation = null;

	speed = 4;

    userId = -1;
    host = false;
    socket = null;

    constructor(socket, userId, host) {
		this.scene.background = new THREE.Color(0x1e1e1e);
		this.spotLight.addTargetToSpotLight(this.table.getTable());
        this.socket = socket;
        this.userId = userId;
        this.host = host;

        // Build animation with AnimationLoopRemote class
        this.animation = new AnimationLoopRemote(
            this.socket,
            this.host,
            this.userId,
            this.table,
            this.ball,
            this.playerOne,
            this.playerTwo,
            this.score,
            this.renderer,
            this.scene,
            this.camera
        )
    }

    addGameToDOM() {
        this.container.parentElement.appendChild(this.renderer.getRenderer().domElement)
    }

    keyDownMovements(event) {
		if (event.key == "W" || event.key == "w") {
			this.animation.pOneMovement.up = true
		}
		if (event.key == "S" || event.key == "s") {
			this.animation.pOneMovement.down = true
		}
    }

    keyReleaseMovements(event) {
		if (event.key == "W" || event.key == "w") {
			this.animation.pOneMovement.up = false
		}
		if (event.key == "S" || event.key == "s") {
			this.animation.pOneMovement.down = false
		}
    }

    startRemoteGame() {
        this.addGameToDOM();
        this.renderer.getRenderer().setAnimationLoop( () => {
            this.animation.animate();
        })
		window.addEventListener('keydown', (e) => {
            this.keyDownMovements(e);
		});
		window.addEventListener('keyup', (e) => {
			this.keyReleaseMovements(e);
		});
    }

    getReceivedDataFromWS(data) {
        if (data.ballDir) {
            this.animation.getBallDirFromReceivedData(data);
        }
        if (data.playerPos) {
            this.animation.updatePlayerPosWithReceivedData(data);
        }
    }

}