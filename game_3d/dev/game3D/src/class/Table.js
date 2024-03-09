import * as THREE from 'three'

export class Table {

	width = (window.innerWidth / 2) * 0.11;
	height = (window.innerHeight / 2) * 0.12;
	yPos = this.height / 2;
	color = 0x1b59f5;
	table = null
	scene = null

	constructor(scene) {
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
