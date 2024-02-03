import * as THREE from 'three';
import Conf from "./constans.js";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

export function runGame() {

	const CONF = new Conf();

	// ---------- RENDERER AND CAMERA ----------
	const renderer = new THREE.WebGLRenderer();
	renderer.shadowMap.enabled = true;
	renderer.setSize(CONF.renderWidth, CONF.renderHeight);

	// document.body.appendChild(renderer.domElement)
	let container = document.getElementById('blackDiv')
	container.parentElement.appendChild(renderer.domElement);


	const scene = new THREE.Scene();
	scene.background = new THREE.Color ( 0x1e1e1e )
	const camera = new THREE.PerspectiveCamera(
		CONF.fov,
		window.innerWidth / window.innerHeight,
		CONF.nearClipping,
		CONF.farClipping
	);

	camera.position.set(0, CONF.cameraYPos, CONF.cameraZPos);
	camera.rotation.set(CONF.cameraXRot, 0, 0)

	// ---------- DEVELOPING HELPERS ----------
	// const orbit = new OrbitControls(camera, renderer.domElement);
	// orbit.update();
	// const axesHelper = new THREE.AxesHelper(5);
	// scene.add(axesHelper);
	// ---------- DEVELOPING HELPERS ----------

	// ---------- LIGTHS ----------
	const spotLight = new THREE.SpotLight(CONF.lightColor);
	scene.add(spotLight);
	spotLight.position.set(0, CONF.lightYPos, CONF.lightZPos);
	spotLight.castShadow = true
	spotLight.angle = CONF.lightAngle;
	spotLight.penumbra = CONF.lightPenumbra;
	spotLight.intensity = CONF.lightIntensity;


	// ---------- GAME ELEMENTS ----------
	// Table
	const tableGeometry = new THREE.PlaneGeometry(CONF.planeWidth, CONF.planeHeight);
	const tableMaterial = new THREE.MeshStandardMaterial({color: CONF.planeColor, transparent: true});
	const table = new THREE.Mesh(tableGeometry, tableMaterial);
	table.position.set(0, CONF.planeYPos, 0);
	table.receiveShadow = true;
	spotLight.target = table; // Adding table as the spotLight target
	scene.add(spotLight.target); // Adding the spotLight target element to the scene

	// --------- DEVELOPING HELPERS ----------
	// const sLightHelper = new THREE.SpotLightHelper(spotLight)
	// scene.add(sLightHelper)
	// ---------- DEVELOPING HELPERS ----------

	// Player One
	const pOneGeometry = new THREE.CapsuleGeometry(
			CONF.playersRadius,
			CONF.playersLength,
			CONF.playersCapSegments,
			CONF.playersRadialSegments
		);
	const pOneMaterial = new THREE.MeshStandardMaterial({color: CONF.playerOneColor});
	const pOne = new THREE.Mesh(pOneGeometry, pOneMaterial);
	scene.add(pOne);
	pOne.position.set(CONF.playerOneXPos, CONF.elementsYPos, CONF.elementsZPos);
	pOne.castShadow = true;

	// Player Two
	const pTwoGeometry = new THREE.CapsuleGeometry(
			CONF.playersRadius,
			CONF.playersLength,
			CONF.playersCapSegments,
			CONF.playersRadialSegments
		);
	const pTwoMaterial = new THREE.MeshStandardMaterial({color: CONF.playerTwoColor});
	const pTwo = new THREE.Mesh(pTwoGeometry, pTwoMaterial);
	scene.add(pTwo);
	pTwo.position.set(CONF.playerTwoXPos, CONF.elementsYPos, CONF.elementsZPos);
	pTwo.castShadow = true;

	// Ball
	console.log(window.innerWidth)
	const ballGeometry = new THREE.TorusGeometry(
			CONF.ballRadius,
			CONF.ballTubeRadius,
			CONF.ballRadialSegments,
			CONF.ballArc
		);
	const ballMaterial = new THREE.MeshStandardMaterial({color: CONF.ballColor});
	const ball = new THREE.Mesh(ballGeometry, ballMaterial);
	scene.add(ball);
	ball.position.set(0, CONF.elementsYPos, CONF.elementsZPos);
	ball.castShadow = true;

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

	// Points variables
	let p1Points = 0
	let p2Points = 0

	// TEXT (Points)
	function buildText() {
		let p1PointsGeometry;
		let p2PointsGeometry;

		const loader = new FontLoader();
		loader.load('./dev/game3D/fonts/helvetiker_regular.typeface.json', (font) => {
			let textConfig = {
				font: font,
				size: 9,
				height: 2,
				curveSegments: 10,
				bevelEnabled: true,
				bevelThickness: 0.5,
				bevelSize: 0.2,
				bevelOffset: 0.1,
				bevelSegments: 10
			};
			p1PointsGeometry = new TextGeometry(p1Points.toString(), textConfig);
			p2PointsGeometry = new TextGeometry(p2Points.toString(), textConfig);

			const textMaterial = new THREE.MeshStandardMaterial({color: CONF.ballColor});

			const p1PointsThree = new THREE.Mesh(p1PointsGeometry, textMaterial);
			p1PointsThree.position.set(-40, 80, 2);
			p1PointsThree.rotation.x = 0.2;
			p1PointsThree.name = 'p1Points'
			scene.add(p1PointsThree);

			const p2PointsThree = new THREE.Mesh(p2PointsGeometry, textMaterial);
			p2PointsThree.position.set(25, 80, 2 );
			p2PointsThree.rotation.x = 0.2;
			p2PointsThree.name = 'p2Points'
			scene.add(p2PointsThree);
		})
	}
	buildText();

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
		if (ball.position.x >= CONF.gameLimitsX || ball.position.x <= -CONF.gameLimitsX) {
			if (ball.position.x >= CONF.gameLimitsX) {
				p1Points += 1
			} else if (ball.position.x <= -CONF.gameLimitsX) {
				p2Points += 1
			}
			ballStarted = false;
			ball.position.x = 0;
			ball.position.y = CONF.elementsYPos;
			pOne.position.y = CONF.elementsYPos;
			pTwo.position.y = CONF.elementsYPos;
			ballSpeed = 1.2;
			pOneImpact = false;
			pTwoImpact = false;
			let removePoints = scene.getObjectByName('p1Points')
			scene.remove(removePoints)
			removePoints = scene.getObjectByName('p2Points')
			scene.remove(removePoints)
			buildText()
		}

		// Calculate collisions
		if (
				(ball.position.x - CONF.ballTotalRadius) <= (pOne.position.x + CONF.playersRadius) &&
				(ball.position.x - CONF.ballTotalRadius) >= (pOne.position.x - CONF.playersRadius) &&
				(ball.position.y) <= (pOne.position.y + (CONF.playersLength / 2) + 1) &&
				(ball.position.y) >= (pOne.position.y - (CONF.playersLength / 2) - 1) &&
				!pOneImpact
		) {
			ballXDirection *= -1;
			let ballToPOneDist = ball.position.y - pOne.position.y;
			let normalizedDist = ballToPOneDist / (CONF.playersLength);
			ballYDirection = normalizedDist * 0.6;
			if (ballSpeed < 4) {
				ballSpeed += 0.1;
			}
			pOneImpact = true;
			pTwoImpact = false;
		}

		if (
				(ball.position.x + CONF.ballTotalRadius) >= (pTwo.position.x - CONF.playersRadius) &&
				(ball.position.x + CONF.ballTotalRadius) <= (pTwo.position.x + CONF.playersRadius) &&
				(ball.position.y) <= (pTwo.position.y + (CONF.playersLength / 2) + 1) &&
				(ball.position.y) >= (pTwo.position.y - (CONF.playersLength / 2) - 1) &&
				!pTwoImpact
		) {
			ballXDirection *= -1;
			let ballToPTwoDist = ball.position.y - pTwo.position.y;
			let normalizedDist = ballToPTwoDist / (CONF.playersLength);
			ballYDirection = normalizedDist * 0.6;
			if (ballSpeed < 4) {
				ballSpeed += 0.1;
			}
			pTwoImpact = true;
			pOneImpact = false;
		}

		if (ball.position.y >= CONF.gameLimitsY || ball.position.y <= 0) {
			ballYDirection *= -1;
		}

		ball.position.x += ballXDirection * ballSpeed;
		ball.position.y += ballYDirection * ballSpeed;

		// ---------- TESING LOGS ----------
		// console.log(`Speed multiplier: ${ballSpeed}`);
		// console.log(`XMovement: ${ballXDirection * ballSpeed}`);
		// ---------- TESING LOGS ----------

		renderer.render(scene, camera);
	}

	window.addEventListener('keydown', (e) => {
		if (e.repeat) { return }
		// Movement for pOne
		if (e.key == "W" || e.key == "w") {
			let pOneY = pOne.position.y;
			if ((pOneY + 3 + CONF.playersLength / 2) < CONF.planeHeight) {
				pOne.position.y += speed;
			}
			return
		}
		if (e.key == "S" || e.key == "s") {
			let pOneY = pOne.position.y;
			if ((pOneY - 3 - CONF.playersLength / 2) > 0) {
				pOne.position.y -= speed;
			}
			return
		}

		// Movement for pTwo
		if (e.key == "ArrowUp") {
			let pTwoY = pTwo.position.y;
			if ((pTwoY + 3 + CONF.playersLength / 2) < CONF.planeHeight) {
				pTwo.position.y += speed;
			}
			return
		}
		if (e.key == "ArrowDown") {
			let pTwoY = pTwo.position.y;
			if ((pTwoY - 3 - CONF.playersLength / 2) > 0) {
				pTwo.position.y -= speed;
			}
			return
		}
	})

	renderer.setAnimationLoop(animate);

}
