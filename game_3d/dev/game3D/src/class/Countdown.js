
import * as THREE from '../three/build/three.module.js';
import { FontLoader } from '../three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from '../three/examples/jsm/geometries/TextGeometry.js';

export class Countdown {

	size = 9
	height = 2
	curveSegments = 10
	bevelEnabled = true
	bevelThickness = 0.5
	bevelSize = 0.2
	bevelOffset = 0.1
	bevelSegments = 10
	color = 0xFFA200;

	yPos = 0
	xPos = 0

    countdown = ''

    countdownMesh = null
	onScene = false

	sizes = null;

	scene = null

	constructor(scene, sizes) {
		this.scene = scene;
		this.sizes = sizes;
		this.buildText();
	}

	buildText() {
		this.yPos = ((this.sizes.height / 2) * 0.12 / 2);
		this.xPos = 0 - (this.countdown.length * this.size) / 2;
		const loader = new FontLoader();
		loader.load('./dev/game3D/fonts/helvetiker_regular.typeface.json', (font) => {
			let textConfig = {
				font: font,
				size: this.size,
				height: this.height,
				curveSegments: this.curveSegments,
				bevelEnabled: this.bevelEnabled,
				bevelThickness: this.bevelEnabled,
				bevelSize: this.bevelSize,
				bevelOffset: this.bevelOffset,
				bevelSegments: this.bevelSegments
			};
			let countdownGeometry = new TextGeometry(this.countdown, textConfig);

			const textMaterial = new THREE.MeshStandardMaterial({color: this.color});

			this.countdownMesh = new THREE.Mesh(countdownGeometry, textMaterial);
			this.countdownMesh.position.set(this.xPos, this.yPos, 3);
			this.countdownMesh.rotation.x = 0.2;
			this.countdownMesh.name = 'countdown'

			this.scene.add(this.countdownMesh);
			this.onScene = true;

		})
	}

	redrawCountdown() {
		if (this.onScene) {
			let countdownObj = this.scene.getObjectByName('countdown');
			this.scene.remove(countdownObj);
		}
		this.yPos = ((this.sizes.height / 2) * 0.12 / 2);
		this.xPos = 0 - (this.countdown.length * this.size) / 2;
		this.buildText();
		this.onScene = true;
	}

    deleteCountdown() {
		let countdownObj = this.scene.getObjectByName('countdown');
        this.scene.remove(countdownObj);
		this.onScene = false;
    }

}
