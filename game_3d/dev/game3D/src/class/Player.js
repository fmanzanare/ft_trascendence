import * as THREE from 'three'

export class Player {

	radius = 1.2;
	length = ((window.innerHeight / 2) * 0.12) * 0.2;
	capSegments = 30;
	radialSegments = 30;
	leftColor = 0x1E1E1E;
	rightColor = 0xFF0000;
	yPos = ((window.innerHeight / 2) * 0.12) / 2;
	xPos = (((window.innerWidth / 2) * 0.11) / 2) - 5;
	zPos = 3;

	player = null;
	scene = null;

	impact = false;
	leftPlayer = false;

	constructor(left, scene) {
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
