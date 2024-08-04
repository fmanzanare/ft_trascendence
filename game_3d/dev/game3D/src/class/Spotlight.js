import * as THREE from '../three/build/three.module.js';

export class Spotlight {
	color = 0xFFFFFF;
	zPos = 100;
	yPos = 0;
	angle = 0.9;
	penumbra = 0.4;
	intensity = 30000;
	spotLigth = new THREE.SpotLight(this.color)
	target = null
	scene = null

	constructor(scene, sizes) {
		this.scene = scene;
		this.yPos = ((sizes.height / 2) * 0.12) / 2;
		this.spotLigth.position.set(0, this.yPos, this.zPos);
		this.spotLigth.castShadow = true
		this.spotLigth.angle = this.angle;
		this.spotLigth.penumbra = this.penumbra;
		this.spotLigth.intensity = this.intensity;
		this.scene.add(this.spotLigth);
	}

	getSpotLight() {
		return this.spotLigth;
	}

	addTargetToSpotLight(target) {
		this.spotLigth.target = target
		this.target = target
	}

	getTarget() {
		return this.target
	}
}
