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
						<div class="fs-3 p-5 text-center" id="playOnline" role="button" style="background-color: #5272c1;">
							<div id="joinTournament">
								<p class="mt-4">Take part in an 8-player tournament</p>
								<p>in which you will play 3 best-of-5 matches</p>
								<p>and get extra points in the standings</p>
							</div>
							<div id="loading" class="fs-3 d-none d-flex justify-content-center align-items-center" style="height: 100%;">
								<div class="spinner-border" role="status">
									<span class="visually-hidden">Looking for a rival</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;
		return page;
    }
}
