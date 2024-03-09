import * as THREE from 'three';
import Conf from "./constans.js";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Table } from './class/Table.js';
import { Spotlight } from './class/Spotlight.js';
import { Camera } from './class/Camera.js';
import { Renderer } from './class/Renderer.js';
import { Player } from './class/Player.js';
import { Ball } from './class/Ball.js';
import { Score } from './class/Score.js';

export function runGame() {

	const CONF = new Conf();

	// ---------- RENDERER AND CAMERA ----------
	const renderer = new Renderer();

	let container = document.getElementById('gameDiv')
	container.parentElement.appendChild(renderer.getRenderer().domElement);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color ( 0x1e1e1e )

	const camera = new Camera()

	// ---------- LIGTHS ----------
	const spotLight = new Spotlight(scene);

	// ---------- GAME ELEMENTS ----------
	const table = new Table(scene);
	spotLight.addTargetToSpotLight(table.getTable());

	const pOne = new Player(true, scene);

	const pTwo = new Player(false, scene);

	// Ball
	const ball = new Ball(scene);

	// Ball and Players control variables
	let speed = 4;
	let ballSpeed = 1.2;
	let ballStarted = false
	let ballXDirection;
	let ballYDirection;
	let firstHit;
	let fisrtYDir;
	let pTwoImpact = false;
	let pOneImpact = false;

	// TEXT (Points)
	const score = new Score(scene);

	// ---------- FUNCTIONS ----------
	function animate() {
		// Ball movement
		if (!ballStarted) {
			Math.random() < 0.5 ? firstHit = -1 : firstHit = 1;
			Math.random() < 0.5 ? fisrtYDir = -1 : fisrtYDir = 1;

			ballXDirection = 0.5 * firstHit;
			let yDir;
			do {
				yDir = Math.random();
			} while(yDir > 0.6);
			ballYDirection = yDir * fisrtYDir;
			ballStarted = true;
		}
		if (ball.getBall().position.x >= CONF.gameLimitsX || ball.getBall().position.x <= -CONF.gameLimitsX) {
			if (ball.getBall().position.x >= CONF.gameLimitsX) {
				score.addPOnePoint();
			} else if (ball.getBall().position.x <= -CONF.gameLimitsX) {
				score.addPTwoPoint();
			}
			ballStarted = false;
			ball.getBall().position.x = 0;
			ball.getBall().position.y = CONF.elementsYPos;
			pOne.getPlayer().position.y = CONF.elementsYPos;
			pTwo.getPlayer().position.y = CONF.elementsYPos;
			ballSpeed = 1.2;
			pOneImpact = false;
			pTwoImpact = false;
			score.redrawScore();
			// let removePoints = scene.getObjectByName('p1Points')
			// scene.remove(removePoints)
			// removePoints = scene.getObjectByName('p2Points')
			// scene.remove(removePoints)
			// buildText()
		}

		// Calculate collisions
		if (
				(ball.getBall().position.x - CONF.ballTotalRadius) <= (pOne.getPlayer().position.x + CONF.playersRadius) &&
				(ball.getBall().position.x - CONF.ballTotalRadius) >= (pOne.getPlayer().position.x - CONF.playersRadius) &&
				(ball.getBall().position.y) <= (pOne.getPlayer().position.y + (CONF.playersLength / 2) + 1) &&
				(ball.getBall().position.y) >= (pOne.getPlayer().position.y - (CONF.playersLength / 2) - 1) &&
				!pOneImpact
		) {
			ballXDirection *= -1;
			let ballToPOneDist = ball.getBall().position.y - pOne.getPlayer().position.y;
			let normalizedDist = ballToPOneDist / (CONF.playersLength);
			ballYDirection = normalizedDist * 0.6;
			if (ballSpeed < 4) {
				ballSpeed += 0.1;
			}
			pOneImpact = true;
			pTwoImpact = false;
		}

		if (
				(ball.getBall().position.x + CONF.ballTotalRadius) >= (pTwo.getPlayer().position.x - CONF.playersRadius) &&
				(ball.getBall().position.x + CONF.ballTotalRadius) <= (pTwo.getPlayer().position.x + CONF.playersRadius) &&
				(ball.getBall().position.y) <= (pTwo.getPlayer().position.y + (CONF.playersLength / 2) + 1) &&
				(ball.getBall().position.y) >= (pTwo.getPlayer().position.y - (CONF.playersLength / 2) - 1) &&
				!pTwoImpact
		) {
			ballXDirection *= -1;
			let ballToPTwoDist = ball.getBall().position.y - pTwo.getPlayer().position.y;
			let normalizedDist = ballToPTwoDist / (CONF.playersLength);
			ballYDirection = normalizedDist * 0.6;
			if (ballSpeed < 4) {
				ballSpeed += 0.1;
			}
			pTwoImpact = true;
			pOneImpact = false;
		}

		if (ball.getBall().position.y >= CONF.gameLimitsY || ball.getBall().position.y <= 0) {
			ballYDirection *= -1;
		}

		ball.getBall().position.x += ballXDirection * ballSpeed;
		ball.getBall().position.y += ballYDirection * ballSpeed;

		// ---------- TESING LOGS ----------
		// console.log(`Speed multiplier: ${ballSpeed}`);
		// console.log(`XMovement: ${ballXDirection * ballSpeed}`);
		// ---------- TESING LOGS ----------

		renderer.getRenderer().render(scene, camera.getCamera());
	}

	window.addEventListener('keydown', (e) => {
		if (e.repeat) { return }
		// Movement for pOne
		if (e.key == "W" || e.key == "w") {
			let pOneY = pOne.getPlayer().position.y;
			if ((pOneY + 3 + CONF.playersLength / 2) < CONF.planeHeight) {
				pOne.getPlayer().position.y += speed;
			}
			return
		}
		if (e.key == "S" || e.key == "s") {
			let pOneY = pOne.getPlayer().position.y;
			if ((pOneY - 3 - CONF.playersLength / 2) > 0) {
				pOne.getPlayer().position.y -= speed;
			}
			return
		}

		// Movement for pTwo
		if (e.key == "ArrowUp") {
			let pTwoY = pTwo.getPlayer().position.y;
			if ((pTwoY + 3 + CONF.playersLength / 2) < CONF.planeHeight) {
				pTwo.getPlayer().position.y += speed;
			}
			return
		}
		if (e.key == "ArrowDown") {
			let pTwoY = pTwo.getPlayer().position.y;
			if ((pTwoY - 3 - CONF.playersLength / 2) > 0) {
				pTwo.getPlayer().position.y -= speed;
			}
			return
		}
	})

	renderer.getRenderer().setAnimationLoop(animate);

}

export function removeGame() {
	let container = document.getElementById('gameDiv')
	let game = document.getElementsByTagName('canvas')[0]

	container.parentElement.removeChild(game);
}
