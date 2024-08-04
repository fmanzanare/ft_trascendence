import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Tournaments");
    }

    async getHtml() {
        let page =
			`
				<div class="container-fluid py-10 h-100">
					<div class="row d-flex justify-content-center align-items-center" style="height:20vh">
						<h1 class="display-1 fw-bold mb-3 text-uppercase text-center" style="color:#80dbef;">Tournament</h1>	
					</div>
					<div class="position-absolute top-50 start-50 translate-middle">
						<div id="joinTournament" class="card h-60" style="border-radius: 1rem; background-color: #5272c1;">
							<div class="card-body p-5 text-center" >
								<div class=" md-5 mt-md-4 pb-5">
									<div>
										<p class="mt-4">Take part in an 4-player tournament</p>
										<div class="form-outline form-white mb-4">
											<input type="text" id="nickTournament" placeholder="Nick for the tournament" class="inputLogIn form-control form-control-lg"/>
										</div>
										<div id="errorDiv">
											<p class="text-danger" id="errorMessage"></p>
										</div>
										<div class="d-grid gap-2">
											<button id="playOnline" class="btn btn-primary btn-dark" type="submit">Join tournament</button>
										</div>
									</div>
								</div>    
							</div>
						</div>
						<div id="gameDiv">
							<div id="loading" class="d-none d-flex flex-column justify-content-center align-items-center h-100">
								<div class="spinner-border" role="status">
									<span class="visually-hidden">Looking for a rival</span>
								</div>
								<div style="margin-top:20px">
									<button id="cancelTournament" class="mt-1 btn btn-secondary btn-lg">Cancel</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;
		return page;
    }
}
