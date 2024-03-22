import * as THREE from 'three';
import { AnimationLoop } from "./Animation";
import { Table } from './Table';
import { Ball } from "./Ball";
import { Player } from "./Player";
import { Renderer } from "./Renderer";
import { Score } from "./Score";
import { Spotlight } from "./Spotlight"
import { Camera } from './Camera';

export class Game {

	container = document.getElementById('gameDiv');
	scene = new THREE.Scene();
	renderer = new Renderer();
	camera = new Camera();
	spotLight = new Spotlight(this.scene);
	table = new Table(this.scene);
	playerOne = new Player(true, this.scene);
	playerTwo = new Player(false, this.scene);
	ball = new Ball(this.scene);
	score = new Score(this.scene);
	animation = null;

	speed = 4;

	remote = false

	constructor(remote) {
		this.remote = remote;
		this.scene.background = new THREE.Color(0x1e1e1e);
		this.spotLight.addTargetToSpotLight(this.table.getTable());

		this.animation = new AnimationLoop(
			this.table,
			this.ball,
			this.playerOne,
			this.playerTwo,
			this.score,
			this.renderer,
			this.scene,
			this.camera,
			remote
		);
	}

	addGameToDOM() {
		this.container.parentElement.appendChild(this.renderer.getRenderer().domElement);
	}

	keyDownMovements(event) {
		if (event.key == "W" || event.key == "w") {
			this.animation.pOneMovement.up = true
		}
		if (event.key == "S" || event.key == "s") {
			this.animation.pOneMovement.down = true
		}
		if (!this.remote) {
			if (event.key == "ArrowUp") {
				this.animation.pTwoMovement.up = true
			}
			if (event.key == "ArrowDown") {
				this.animation.pTwoMovement.down = true
			}
		}
	}

	keyReleaseMovements(event) {
		if (event.key == "W" || event.key == "w") {
			this.animation.pOneMovement.up = false;
		}
		if (event.key == "S" || event.key == "s") {
			this.animation.pOneMovement.down = false;
		}
		if (!this.remote) {
			if (event.key == "ArrowUp") {
				this.animation.pTwoMovement.up = false;
			}
			if (event.key == "ArrowDown") {
				this.animation.pTwoMovement.down = false;
			}
		}
	}

	startGame() {
		this.addGameToDOM();
		this.renderer.getRenderer().setAnimationLoop( () => {
			this.animation.animate(null, null)
		});
		window.addEventListener('keydown', (e) => {
			if (!this.remote) {
				this.keyDownMovements(e);
			}
		});
		window.addEventListener('keyup', (e) => {
			if (!this.remote) {
				this.keyReleaseMovements(e);
			}
		});
	}

	startRemoteGame(ballDir, socket) {
		this.addGameToDOM();
		this.renderer.getRenderer().setAnimationLoop( () => {
			this.animation.animate(ballDir, socket)
		});
	}

}
