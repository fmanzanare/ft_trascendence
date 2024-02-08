import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Signup");
    }
    async getHtml() {
        let page =
			`
				<div class="container py-5 h-100">
					<div class="row d-flex justify-content-center align-items-center h-100">
						<h1 class="display-1 fw-bold mb-3 text-uppercase text-center" style="color:#80dbef;">Pong</h1>
						<div class="col-12 mt-5 col-md-8 col-lg-6 col-xl-5">
							<div class="card" style="border-radius: 1rem; background-color: #5272c1;">
								<div class="card-body p-5 text-center" >
									<div>
										<h2 class="fw-bold mb-2 text-uppercase">Welcome</h2>
										<p class="text-black-50 mb-5">Sign up to transcendence</p>
										<div class="form-outline form-white mb-4">
											<input type="text" id="Name" placeholder="Name" class="form-control form-control-lg"/>
										</div>
										<div class="form-outline form-white mb-4">
											<input type="text" id="UserName" placeholder="Username" class="form-control form-control-lg"/>
										</div>
										<div class="form-outline form-white mb-4">
											<input type="password" id="PassWord" placeholder="Password" class="form-control form-control-lg password"/>
										</div>
										<div class="form-outline form-white mb-4">
											<input type="password" id="PassWordRep" placeholder="Repeat password" class="form-control form-control-lg password"/>
										</div>
										<div id="errorDiv">
											<p class="text-danger" id="errorMessage"></p>
										</div>
										<div class="d-grid gap-2">
											<button class="btn btn-primary btn-dark" id="singUpButton" type="submit">Sing up</button>
										</div>
										<div>
											<p class="mb-0">Already have an account?<a href="/login" class="text-white-50 fw-bold" data-link>Log In</a></p>
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