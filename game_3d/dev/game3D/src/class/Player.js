import * as THREE from '../three/build/three.module.js';

export class Player {

	radius = 1.2;
	length = 0;
	capSegments = 30;
	radialSegments = 30;
	leftColor = 0x1E1E1E;
	rightColor = 0xFF0000;
	yPos = 0;
	xPos = 0;
	zPos = 3;

	player = null;
	scene = null;

	impact = false;
	leftPlayer = false;

	constructor(left, scene, sizes) {
		this.length = ((sizes.height / 2) * 0.12) * 0.2;
		this.yPos = ((sizes.height / 2) * 0.12) / 2;
		this.xPos = (((sizes.width / 2) * 0.11) / 2) - 5;
		this.leftPlayer = left;
		this.scene = scene;
		const geometry = new THREE.CapsuleGeometry(
			this.radius,
			this.length,
			this.capSegments,
			this.radialSegments
		);
		let material = null;
		if (left) {
			material = new THREE.MeshStandardMaterial({color: this.leftColor});
		} else {
			material = new THREE.MeshStandardMaterial({color: this.rightColor});
		}
		this.player = new THREE.Mesh(geometry, material);

		this.player.position.set((left ? this.xPos * -1 : this.xPos), this.yPos, this.zPos);
		this.player.castShadow = true;
		this.scene.add(this.player);
	}

	getPlayer() {
		return this.player;
	}

}
