import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Login");
    }
    async getHtml() {
		let page =
			`
				<div id="LogInDiv" class="container py-5 h-80">
					<div class="row d-flex justify-content-center align-items-center h-100">
						<h1 class="display-1 fw-bold mb-3 text-uppercase text-center" style="color:#80dbef;">Pong</h1>
						<div class="col-12 mt-5 col-md-8 col-lg-6 col-xl-5">
							<div class="card h-60" style="border-radius: 1rem; background-color: #5272c1;">
								<div class="card-body p-5 text-center" >
									<div class=" md-5 mt-md-4 pb-5">
										<h2 class="fw-bold mb-2 text-uppercase">Welcome</h2>
										<p class="text-black-50 mb-5">Sign in to transcendence</p>
										<div class="form-outline form-white mb-4">
											<input type="text" id="UserName" placeholder="Username" class="inputLogIn form-control form-control-lg"/>
										</div>
										<div class="form-outline form-white mb-4">
											<input type="password" id="PassWord" placeholder="Password" class="inputLogIn form-control form-control-lg password" />
										</div>
										<div id="errorDiv">
											<p class="text-danger" id="errorMessage"></p>
										</div>
										<div class="d-grid gap-2">
											<button id="loginButton" class="btn btn-primary btn-dark" type="submit">Login</button>
										</div>
										<div>
											<p class="mb-0">Don't have an account?<a href="/signup" class="text-white-50 fw-bold" data-link>Sign Up</a></p>
										</div>
										<div>
											<p class="mb-0">Do you have an account in 42?<a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-bc0560f1cfd8004427e4a9f9762692079fe9c21cdb304a775117968b4e7b4f60&redirect_uri=https%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth&response_type=code" class="text-white-50 fw-bold">Sing In</a></p>
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
