class Conf {
	// Render settigns
	renderWidth = window.innerWidth / 2;
	renderHeight = window.innerHeight / 2;

	// Camera settings
	fov = 45;
	nearClipping = 0.1;
	farClipping = 1000;
	cameraYPos = -20;
	cameraZPos = 100;
	cameraXRot = 0.5;

	// Plane (board) settings
	planeWidth = this.renderWidth * 0.11;
	planeHeight = this.renderHeight * 0.12;
	planeYPos = this.planeHeight / 2;
	planeColor = 0x1b59f5;

	// Left wall --> NOT DONE!!!!!!!!
	lWallHeight = 20;
	lWallWidth = this.planeHeight;
	lWallXPos = this.planeWidth / 2 * -1;

	// Light settings
	lightColor = 0xFFFFFF;
	lightZPos = 100;
	lightYPos = this.planeYPos;
	lightAngle = 0.8;
	lightPenumbra = 0.4;
	lightIntensity = 30000;

	// Elements common settings
	elementsZPos = 3;
	elementsYPos = this.planeYPos;

	// Players settings
	playersRadius = 1.2;
	playersLength = this.planeHeight * 0.2;
	playersCapSegments = 30;
	playersRadialSegments = 30;
	playerOneColor = 0x1E1E1E;
	playerTwoColor = 0xFF0000;
	playerTwoXPos = (this.planeWidth / 2) - 5;
	playerTwoYPos = this.planeYPos;
	playerOneXPos = this.playerTwoXPos * -1;
	playerOneYPos = this.planeYPos;

	// Ball settings
	ballRadius = 1;
	ballTubeRadius = 0.5;
	ballTotalRadius = this.ballRadius + this.ballTubeRadius;
	ballRadialSegments = 15;
	ballArc = 40;
	ballColor = 0xFFA200;
	ballYPos = this.planeYPos;

	// Interaction limits
	gameLimitsY = this.planeHeight - this.ballTotalRadius;
	gameLimitsX = this.planeWidth / 2 + this.ballTotalRadius;
};


export default Conf;
