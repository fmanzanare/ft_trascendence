import * as THREE from 'three'
import { GameSizes } from './Sizes';

export class Renderer {

	width = 0;
	height = 0;
	renderer = null;

	constructor(sizes) {
		this.width = sizes.width / 2;
		this.height = sizes.height / 2;
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.shadowMap.enabled = true;
		this.renderer.setSize(this.width, this.height);
	}

	getRenderer() {
		return this.renderer;
	}

}
