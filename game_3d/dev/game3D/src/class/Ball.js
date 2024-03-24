import * as THREE from 'three'

export class Ball {

	radius = 1;
	tubeRadius = 0.5;
	totalRadius = this.radius + this.tubeRadius;
	radialSegments = 15;
	arc = 40;
	color = 0xFFA200;
	yPos = 0;
	zPos = 3;
	gameLimitY = 0;
	gameLimitX = 0;
	ball = null
	scene = null

	constructor(scene, sizes) {
		this.yPos = ((sizes.height / 2) * 0.12 / 2);
		this.gameLimitY = ((sizes.height / 2) * 0.12) - this.totalRadius;
		this.gameLimitX = ((sizes.width / 2) * 0.11) + this.totalRadius;
		this.scene = scene;
		const geometry = new THREE.TorusGeometry(
			this.radius,
			this.tubeRadius,
			this.radialSegments,
			this.arc
		);
		const material = new THREE.MeshStandardMaterial({color: this.color});
		this.ball = new THREE.Mesh(geometry, material);
		this.ball.position.set(0, this.yPos, this.zPos);
		this.ball.castShadow = true;
		this.scene.add(this.ball);
	}

	getBall() {
		return this.ball;
	}

	getGameLimitY() {
		return this.gameLimitY;
	}

	getGameLimitX() {
		return this.gameLimitX;
	}

}
