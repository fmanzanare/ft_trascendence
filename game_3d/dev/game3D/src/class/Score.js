import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

export class Score {

	size = 9
	height = 2
	curveSegments = 10
	bevelEnabled = true
	bevelThickness = 0.5
	bevelSize = 0.2
	bevelOffset = 0.1
	bevelSegments = 10
	color = 0xFFA200;

	pOne = null;
	pTwo = null;

	pOneScore = 0;
	pTwoScore = 0;

	scene = null

	constructor(scene) {
		this.scene = scene;
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
			let pOnePointsGeometry = new TextGeometry(this.pOneScore.toString(), textConfig);
			let pTwoPointsGeometry = new TextGeometry(this.pTwoScore.toString(), textConfig);

			const textMaterial = new THREE.MeshStandardMaterial({color: this.color});

			this.pOne = new THREE.Mesh(pOnePointsGeometry, textMaterial);
			this.pOne.position.set(-40, 80, 2);
			this.pOne.rotation.x = 0.2;
			this.pOne.name = 'p1Points'

			this.pTwo = new THREE.Mesh(pTwoPointsGeometry, textMaterial);
			this.pTwo.position.set(25, 80, 2 );
			this.pTwo.rotation.x = 0.2;
			this.pTwo.name = 'p2Points'
			this.addScoreToScene()
		})
	}

	addScoreToScene() {
		this.scene.add(this.pOne);
		this.scene.add(this.pTwo);
	}

	getPOneScore() {
		return this.pOne;
	}

	getPTwoScore() {
		return this.pTwo;
	}

	redrawScore() {
		let score = this.scene.getObjectByName('p1Points');
		this.scene.remove(score);
		score = this.scene.getObjectByName('p2Points');
		this.scene.remove(score);
		this.buildText();
	}

	addPOnePoint() {
		this.pOneScore += 1;
		this.redrawScore();
	}

	addPTwoPoint() {
		this.pTwoScore += 1;
		this.redrawScore();
	}

	resetScore() {
		this.pOneScore = 0;
		this.pTwoScore = 0;
		this.redrawScore();
	}

}
