import * as THREE from 'three'

export class Camera {

	fov = 45;
	nearClipping = 0.1;
	farClipping = 1000;
	yPos = -20;
	zPos = 100;
	xRot = 0.5;
	camera = null

	constructor() {
		this.camera = new THREE.PerspectiveCamera(
			this.fov,
			window.innerWidth / window.innerHeight,
			this.nearClipping,
			this.farClipping
		);

		this.camera.position.set(0, this.yPos, this.zPos);
		this.camera.rotation.set(this.xRot, 0, 0)
	}

	getCamera() {
		return this.camera;
	}


}
