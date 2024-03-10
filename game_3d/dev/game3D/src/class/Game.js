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

	constructor() {
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
			this.camera
		);

		this.startGame();
	}

	addGameToDOM() {
		this.container.parentElement.appendChild(this.renderer.getRenderer().domElement);
	}

	keyDownMovements(event) {
		// if (e.repeat) { return };
		if (event.key == "W" || event.key == "w") {
			this.animation.pOneMovement.up = true
		}
		if (event.key == "S" || event.key == "s") {
			this.animation.pOneMovement.down = true
		}
		if (event.key == "ArrowUp") {
			this.animation.pTwoMovement.up = true
		}
		if (event.key == "ArrowDown") {
			this.animation.pTwoMovement.down = true
		}
	}

	keyReleaseMovements(event) {
		if (event.key == "W" || event.key == "w") {
			this.animation.pOneMovement.up = false;
		}
		if (event.key == "S" || event.key == "s") {
			this.animation.pOneMovement.down = false;
		}
		if (event.key == "ArrowUp") {
			this.animation.pTwoMovement.up = false;
		}
		if (event.key == "ArrowDown") {
			this.animation.pTwoMovement.down = false;
		}
	}

	startGame() {
		this.addGameToDOM();
		this.renderer.getRenderer().setAnimationLoop( () => {
			this.animation.animate()
		});
		window.addEventListener('keydown', (e) => {
			this.keyDownMovements(e);
		});
		window.addEventListener('keyup', (e) => {
			this.keyReleaseMovements(e);
		});
	}

}
