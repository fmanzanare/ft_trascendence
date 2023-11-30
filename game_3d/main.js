import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

/* SCENE AND CAMERA DEFINITIONS */
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x8987ff );
const camera = new THREE.PerspectiveCamera( 75, (window.innerWidth / 2) / (window.innerHeight / 2), 4, 5 );

/* RENDERER DEFINITION (canvas tag in html) */
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
let gameContainer = document.getElementsByClassName('gameContainer')[0];
// renderer is a <canvas> element that ThreeJS creates on document
gameContainer.appendChild( renderer.domElement );

/* BALL DEFINITION */
const ballGeometry = new THREE.SphereGeometry( 0.1, 32, 16 );
const ballMaterial = new THREE.MeshBasicMaterial( { color: 0xfffb00 } );
const ball = new THREE.Mesh( ballGeometry, ballMaterial );
scene.add( ball );

/* PLAYER 1 DEFINITION */
const capsuleGeo = new THREE.CapsuleGeometry( 0.1, 2, 80, 80 );
const p1Material = new THREE.MeshBasicMaterial( { color: 0x1a1a1a } );
const p1 = new THREE.Mesh( capsuleGeo, p1Material );
p1.position.x = -6.5;
scene.add( p1 );

/* PLAYER 2 DEFINITION */
const p2Material = new THREE.MeshBasicMaterial( { color: 0x7a0000 } );
const p2 = new THREE.Mesh( capsuleGeo, p2Material );
p2.position.x = 6.5;
scene.add( p2 );

camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}


if ( WebGL.isWebGLAvailable() ) {

	// Initiate function or other initializations here
	animate();

} else {

	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );

}

