import { Ball } from "./class/Ball";
import { Player } from "./class/Player";
import { Renderer } from "./class/Renderer";
import { Score } from "./class/Score";
import { Spotlight } from "./class/Spotlight"

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

	speed = 4;

	constructor() {

		this.scene.background = new THREE.Color(0x1e1e1e);
		this.spotLight.addTargetToSpotLight(this.table);

		this.startGame();
	}

	addGameToDOM() {
		this.container.parentElement.appendChild(this.renderer.getRenderer().domElement);
	}

	startGame() {
		this.renderer.getRenderer().setAnimationLoop(this.animate);
	}

	animate() {
		// TODO - Animation loop implemmentation!!
		console.log("TODO!!! - Animation loop")
	}

	keyDownMovements(event) {
		if (event.key == "W" || event.key == "w") {
			if ((this.playerTwo.position.y + 3 + this.playerTwo.length / 2) < this.table.height) {
				this.playerTwo.position.y += this.speed;
			}
		}

		// TODO!!!! Keep doing the movements
	}

}
