import * as THREE from '../three/build/three.module.js';
import { AnimationLoop } from "./Animation.js";
import { Table } from './Table.js';
import { Ball } from "./Ball.js";
import { Player } from "./Player.js";
import { Renderer } from "./Renderer.js";
import { Score } from "./Score.js";
import { Spotlight } from "./Spotlight.js"
import { navigateTo } from "../../../frontend/helpers/navigateto.js";
import { Camera } from './Camera.js';
import { GameSizes } from './Sizes.js';

export class Game {

	sizes = new GameSizes(true);
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
	cancelled = false;

	speed = 4;

	constructor() {
		this.scene.background = new THREE.Color(0x1e1e1e);
		this.spotLight.addSpotLightToScene();
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
		if (event.key == "ArrowUp") {
			event.preventDefault()
			this.animation.pTwoMovement.up = true
		}
		if (event.key == "ArrowDown") {
			event.preventDefault()
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
			event.preventDefault()
			this.animation.pTwoMovement.up = false;
		}
		if (event.key == "ArrowDown") {
			event.preventDefault()
			this.animation.pTwoMovement.down = false;
		}
	}

	stopGame() {
		this.cancelled = true;
	}

	startGame() {
		this.ball.addBallToScene();
		this.addGameToDOM();
		this.renderer.getRenderer().setAnimationLoop( () => {
			if (this.cancelled) {
				return ;
			}
			let winner = this.animation.animate();
			if (winner == 1) {
				sessionStorage.setItem('winner', "Player one");
				navigateTo("/home");
			} else if (winner == 2) {
				sessionStorage.setItem('winner', "Player two");
				navigateTo("/home");
			}
		});
		window.addEventListener('keydown', (e) => {
			this.keyDownMovements(e);
		});
		window.addEventListener('keyup', (e) => {
			this.keyReleaseMovements(e);
		});
	}

}
