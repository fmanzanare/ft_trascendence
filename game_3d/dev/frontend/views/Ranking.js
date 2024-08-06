import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Ranking");
    }

    async getHtml() {
        let rankig;
	    const $token = sessionStorage.getItem('pongToken');
        return fetch("https://localhost:4000/api/ranking/", {
            method: "GET",
            headers: {
                "Authorization": $token
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Hubo un problema al realizar la solicitud.');
            }
            return response.json();
        })
        .then(data => {
            rankig = data.users
            let page =
            `
                <div class="container-fluid py-10 h-100">
                    <div class="row d-flex justify-content-center align-items-center" style="height:20vh">
                        <h1 class="display-1 fw-bold mb-3 text-uppercase text-center" style="color:#80dbef;">Ranking</h1>	
                    </div>
                    <div class="container fs-3 mx-auto" style="margin-top: 4rem;">
                        <ol id="rankigList" class="list-group">
                            <li class="list-group-item d-flex justify-content-around" style="background-color: #5272c1;">
                                <div class="col p-2 text-center">Name</div>
                                <div class="col p-2 text-center">Wins</div>
                                <div class="col p-2 text-center">Loss</div>
                                <div class="col p-2 text-center">Tournaments</div>
                                <div class="col p-2 text-center">Points</div>
                            </li>
                            ${rankig.slice(0, 5).map(item => `
                                <li class="list-group-item d-flex justify-content-around" style="background-color: #8da3d9;">
                                    <div class="col p-2 text-center"onClick="goToUserProfile(${item.id})" style="cursor: pointer">${item.username}</div>
                                    <div class="col p-2 text-center">${item.games_won}</div>
                                    <div class="col p-2 text-center">${item.games_played - item.games_won}</div>
                                    <div class="col p-2 text-center">${item.tournaments}</div>
                                    <div class="col p-2 text-center">${item.points}</div>
                                </li>
                            `).join('')}
                        </ol>
                    </div>
                </div>
            `;
		    return page;
        })
    }
}