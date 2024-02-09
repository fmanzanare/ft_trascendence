import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Login");
    }
    async getHtml() {
		let page =
			`
				<div id="twoFactorDiv" class="container py-5 h-80">
					<div class="row d-flex justify-content-center align-items-center h-100">
						<h1 class="display-1 fw-bold mb-3 text-uppercase text-center" style="color:#80dbef;">Pong</h1>
						<div class="col-12 mt-5 col-md-8 col-lg-6 col-xl-5">
							<div class="card h-60" style="border-radius: 1rem; background-color: #5272c1;">
								<div class="card-body p-5 text-center" >
									<div class=" md-5 mt-md-4 pb-5">
										<h2 class="fw-bold mb-2 text-uppercase">Welcome</h2>
										<p class="text-black-50 mb-5">Sign in to transcendence</p>
										<div class="form-outline form-white mb-4">
											<input type="text" id="doubleFK" placeholder="double factor key" class="form-control form-control-lg"/>
										</div>
										<div class="d-grid gap-2">
											<button id="twoFactorButton" class="btn btn-primary btn-dark" type="submit">Login</button>
										</div>
									</div>    
								</div>
							</div>
						</div>
					</div>
				</div>
			`;
		return page;
    }
}