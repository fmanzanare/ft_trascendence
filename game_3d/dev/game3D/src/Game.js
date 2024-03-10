import * as THREE from 'three';
import { AnimationLoop } from "./class/Animation";
import { Table } from './class/Table';
import { Ball } from "./class/Ball";
import { Player } from "./class/Player";
import { Renderer } from "./class/Renderer";
import { Score } from "./class/Score";
import { Spotlight } from "./class/Spotlight"
import { Camera } from './class/Camera';

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
		if (event.key == "W" || event.key == "w") {
			if ((this.playerOne.getPlayer().position.y + 3 + this.playerOne.length / 2) < this.table.height) {
				this.animation.pOneMovement.up = true
			}
		}
		if (event.key == "S" || event.key == "s") {
			if ((this.playerOne.getPlayer().position.y - 3 - this.playerOne.length / 2) > 0) {
				this.animation.pOneMovement.down = true
			}
		}
		if (event.key == "ArrowUp") {
			if ((this.playerTwo.getPlayer().position.y + 3 + this.playerTwo.length / 2) < this.table.height) {
				this.animation.pTwoMovement.up = true
			}
		}
		if (event.key == "ArrowDown") {
			if ((this.playerTwo.getPlayer().position.y - 3 - this.playerTwo.length / 2) > 0) {
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
