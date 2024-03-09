import * as THREE from 'three'

export class Renderer {

	width = window.innerWidth / 2;
	height = window.innerHeight / 2;
	renderer = null;

	constructor() {
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.shadowMap.enabled = true;
		this.renderer.setSize(this.width, this.height);
	}

	getRenderer() {
		return this.renderer;
	}

}
