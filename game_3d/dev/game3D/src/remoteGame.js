import * as THREE from 'three';
import Conf from "./constans.js";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js';


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

export function createStaticGame() {

	const CONF = new Conf();

	// ---------- RENDERER AND CAMERA ----------
	const renderer = new THREE.WebGLRenderer();
	renderer.shadowMap.enabled = true;
	renderer.setSize(CONF.renderWidth, CONF.renderHeight);

	let container = document.getElementById('gameDiv')
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
	spotLight.target = table;
	scene.add(spotLight.target);

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

	buildText();

}
