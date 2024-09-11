import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Pongue");
    }
    
    async getHtml() {
        const $token = sessionStorage.getItem('pongToken');
        const fetchProfile = async () => {
            const $profileUrl = apiUrl + 'profile/';
            const response = await fetch($profileUrl, {
                method: "GET",
                headers: { "Authorization": $token }
            });

            if (!response.ok) {
                throw new Error('Unexpected error.');
            }
            const data = await response.json();
            return data;
        };

        const $width = window.innerWidth / 2;
        const $Height = window.innerHeight / 2;
        const data = await fetchProfile();
        if (!sessionStorage.getItem('user')){
            sessionStorage.setItem('user', data.context.user.username);
        }
        let page =
            `
                <div class="container-fluid py-10 h-100">
                    <div class="row d-flex justify-content-center align-items-center" style="height:20vh">
                        <h1 class="display-1 fw-bold mb-3 text-uppercase text-center" style="color:#80dbef;">Pong</h1>	
                    </div>
                    <div class="row d-flex justify-content-center align-items-center h-100">
                        <div id="gameDiv">
                            <div class="rounded" id="blackDiv" style="Height:${$Height}px;width:${$width}px">
                                <div class="d-flex justify-content-around align-items-center" id="selectMode" style="height:100%">
                                    <div class="fs-3 p-2 h-50 bd-highlight button" id="playOnline" role="button" style="width:25%;">
                                        <div class="rounded d-flex flex-column justify-content-center p-3 h-100 text-center" style="background-color: #5272c1;">
                                            <h1>1 vs 1</h1>
                                            <p>Online</p>
                                        </div>
                                    </div>
                                    <div class="fs-3 p-2 h-50 bd-highlight button" id="playLocal" role="button" style="width:25%;">
                                        <div class="rounded d-flex flex-column justify-content-center p-3 h-100 text-center" style="background-color: #5272c1;">
                                            <h1>Local</h1>
                                            <p>One vs one</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="loading" class="d-none d-flex flex-column justify-content-center align-items-center h-100">
                                    <div class="spinner-border" role="status">
                                        <span class="visually-hidden">Looking for a rival</span>
                                    </div>
                                    <div style="margin-top:20px">
                                        <button id="cancelGame" class="mt-1 btn btn-secondary btn-lg">Cancel</button>
                                    </div>
                                </div>
                            </div>
                            <div id="winnerDiv" class="d-none position-relative" style="Height:${$Height}px;width:${$width}px;background-color:#1e1e1e">
                                <div class="d-flex flex-column justify-content-evenly align-items-center h-100">
                                    <h1 id="playerWinner" style="color:white;"></h1>
                                    <button id="btnCloseWinner" class="btn btn-secondary btn-lg">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="instructions">
                        <div class="rounded p-3 h-100 text-center" style="background-color: #5272c1;">
                            <h2>Instructions</h2>
                            <div id="instructionsImg">
                                <img src="./dev/frontend/assets/ws.webp" alt="instructions">
                            </div>   
                        </div>
                    </div>
                    <div id="instructionsTwoPlayer" class="d-flex d-none justify-content-around" style="margin-top:10px">
                        <div class="rounded p-3 text-center" style="background-color: #5272c1;">
                            <h4>Instructions player one</h4>
                            <div id="instructionsImg">
                                <img src="./dev/frontend/assets/ws.webp" alt="instructions">
                            </div>   
                        </div>
                        <div class="rounded p-3 text-center" style="background-color: #5272c1;">
                            <h4>Instructions player two</h4>
                            <div id="instructionsImg">
                                <img src="./dev/frontend/assets/sb.webp" alt="instructions">
                            </div>   
                        </div>
                    </div>
                </div>
            `;
		return page;
    }
}
