import * as THREE from 'three'
import { GameSizes } from './Sizes';

export class Table {

	width = 0;
	height = 0;
	yPos = 0;
	color = 0x1b59f5;
	table = null
	scene = null

	constructor(scene, sizes) {
		this.width = (sizes.width / 2) * 0.11;
		this.height = (sizes.height / 2) * 0.12;
		this.yPos = this.height / 2;
		this.scene = scene;
		const tableGeometry = new THREE.PlaneGeometry(this.width, this.height);
		const tableMaterial = new THREE.MeshStandardMaterial({color: 0x1b59f5});
		this.table = new THREE.Mesh(tableGeometry, tableMaterial);

		this.table.position.set(0, this.yPos, 0);
		this.table.receiveShadow = true;
		this.scene.add(this.table);
	}

	getTable() {
		return this.table
	}

}
