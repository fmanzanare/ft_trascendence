import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Pongue");
    }
    async getHtml() {
        let page =
            `
                <div class="container-fluid py-10 h-100">
                    <div class="row d-flex justify-content-center align-items-center" style="height:20vh">
                        <h1 class="display-1 fw-bold mb-3 text-uppercase text-center" style="color:#80dbef;">Pong</h1>	
                    </div>
                    <div class="row d-flex justify-content-center align-items-center h-100">
                        <div id="blackDiv">
                            <div class="d-flex justify-content-around align-items-center" id="selectMode" style="height:100%">
                                <div class="fs-3 p-2 h-50 bd-highlight" id="playOnline" role="button" style="width:25%;">
                                    <div class="d-flex flex-column justify-content-center p-3 h-100 text-center" style="background-color: #5272c1;">
                                        <h1>1 vs 1</h1>
                                        <p>Play an online 1 vs 1 game</p>
                                    </div>
                                </div>
                                <div class="fs-3 p-2 h-50 bd-highlight" role="button" style="width:25%;">
                                    <div class="d-flex flex-column justify-content-center p-3 h-100 text-center" style="background-color: #5272c1;">
                                        <h1>1 vs AI</h1>
                                        <p>Play a game  against the AI</p>
                                    </div>
                                </div>
                                <div class="fs-3 p-2 h-50 bd-highlight" id="playLocal" role="button" style="width:25%;">
                                    <div class="d-flex flex-column justify-content-center p-3 h-100 text-center" style="background-color: #5272c1;">
                                        <h1>Local</h1>
                                        <p>Play a one vs one game on the same pc</p>
                                    </div>
                                </div>
                            </div>
                            <div id="loading" class="d-none d-flex justify-content-center align-items-center" style="height: 100%;">
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Looking for a rival</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="instructions">
                        <div class="p-3 h-100 text-center" style="background-color: #5272c1;">
                            <h2>Instructions</h2>
                            <div id="instructionsImg">
                                <img src="./dev/frontend/assets/ws.webp" alt="instructions">
                            </div>   
                        </div>
                    </div>
                </div>
            `;
		return page;
    }
}
