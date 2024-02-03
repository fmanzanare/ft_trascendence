import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Ranking");
    }

    async getHtml() {
		let collection = ['jugador1', 'jugador2'];
        let page = `
            <div class="container">
                <div class="justify-content-center align-items-center">
                    <h1 class="display-1 fw-bold mb-3 text-uppercase text-center" style="color:#80dbef;">Ranking</h1>
                    <div class="mx-auto" style="margin-top: 4rem;">
                        <ol class="list-group">
                            <li class="list-group-item d-flex justify-content-around" style="background-color: #5272c1;">
                                <div class="p-2">Name</div>
                                <div class="p-2">Wins</div>
                                <div class="p-2">Loss</div>
                                <div class="p-2">Tournaments</div>
                                <div class="p-2">Points</div>
                            </li>
                            <li class="list-group-item d-flex justify-content-around" style="background-color: #8da3d9;">
                                <div class="p-2">Name</div>
                                <div class="p-2">Wins</div>
                                <div class="p-2">Loss</div>
                                <div class="p-2">Tournaments</div>
                                <div class="p-2">Points</div>
                            </li>
                            <li class="list-group-item d-flex justify-content-around" style="background-color: #8da3d9;">
                                <div class="p-2">Name</div>
                                <div class="p-2">Wins</div>
                                <div class="p-2">Loss</div>
                                <div class="p-2">Tournaments</div>
                                <div class="p-2">Points</div>
                            </li>
                            <li class="list-group-item d-flex justify-content-around" style="background-color: #8da3d9;">
                                <div class="p-2">Name</div>
                                <div class="p-2">Wins</div>
                                <div class="p-2">Loss</div>
                                <div class="p-2">Tournaments</div>
                                <div class="p-2">Points</div>
                            </li>
                            <li class="list-group-item d-flex justify-content-around" style="background-color: #8da3d9;">
                                <div class="p-2">Name</div>
                                <div class="p-2">Wins</div>
                                <div class="p-2">Loss</div>
                                <div class="p-2">Tournaments</div>
                                <div class="p-2">Points</div>
                            </li>
                            <li class="list-group-item d-flex justify-content-around" style="background-color: #8da3d9;">
                                <div class="p-2">Name</div>
                                <div class="p-2">Wins</div>
                                <div class="p-2">Loss</div>
                                <div class="p-2">Tournaments</div>
                                <div class="p-2">Points</div>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        `;
		
		return page;
    }
}