import * as THREE from '../three/build/three.module.js';
import { FontLoader } from '../three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from '../three/examples/jsm/geometries/TextGeometry.js';

export class PlayersNames {

	size = 4
	height = 0.1
	curveSegments = 10
	bevelEnabled = true
	bevelThickness = 0.2
	bevelSize = 0.2
	bevelOffset = 0.1
	bevelSegments = 10
	color = 0xFFA200;

	pOne = null;
	pTwo = null;

	pOneName = '';
	pTwoName = '';

	scene = null

	constructor(scene, pOneName, pTwoName) {
		this.scene = scene;
        this.pOneName = pOneName;
        this.pTwoName = pTwoName;
		this.buildText();
	}

	buildText() {
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
			let pOneNameGeometry = new TextGeometry(this.pOneName, textConfig);
			let pTwoNameGeometry = new TextGeometry(this.pTwoName, textConfig);

			const textMaterial = new THREE.MeshStandardMaterial({color: this.color});

			this.pOne = new THREE.Mesh(pOneNameGeometry, textMaterial);
            let xPosition = -45 - (this.pOneName.length * this.size)
			this.pOne.position.set(xPosition, 80, 2);
			this.pOne.rotation.x = 0.2;
			this.pOne.name = 'p1Name'

			this.pTwo = new THREE.Mesh(pTwoNameGeometry, textMaterial);
            xPosition = 45
			this.pTwo.position.set(xPosition, 80, 2);
			this.pTwo.rotation.x = 0.2
			this.pTwo.name = 'p2Name'
			this.addNamesToScene()
		})
	}

	addNamesToScene() {
		this.scene.add(this.pOne);
		this.scene.add(this.pTwo);
	}

	getPOneName() {
		return this.pOne;
	}

	getPTwoName() {
		return this.pTwo;
	}

	redrawNames() {
		let name = this.scene.getObjectByName('p1Name');
		this.scene.remove(name);
		name = this.scene.getObjectByName('p2Name');
		this.scene.remove(name);
		this.buildText();
	}

}
