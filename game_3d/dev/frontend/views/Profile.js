import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Profile");
    }

    async getHtml() {
		const $token = sessionStorage.getItem('pongToken');
		const $profileUrl = apiUrl + 'profile/';
		return fetch($profileUrl, {
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
			console.log(data);
			let page =
			`
				<div class="container-fluid py-10 h-100">
					<div class="row d-flex justify-content-center align-items-center" style="height:20vh">
						<h1 class="display-1 fw-bold mb-3 text-uppercase text-center" style="color:#80dbef;">Profile</h1>	
					</div>
					<div class="container h-100">
					<div class="row d-flex justify-content-around">
						<div class="col">
							<div class="container fs-3 mx-auto" style="margin-top: 4rem;">
								<div class="row justify-content-center">
									<div class="col-8">
										<div class="card shadow-sm" style="width: 18rem; margin-top: 4rem">
											<img src="./dev/frontend/assets/ws.webp" class="card-img-top" id="profileImg" alt="Profile image">
											<div class="card-body" style="background-color: #8da3d9">
												<h5 class="card-title">${data.context.user.display_name}</h5>
												<p class="card-text">points</p>
												<a id="dataUserButton" class="btn btn-primary">Change data user</a>
											</div>
										</div>
										<div class="d-none card shadow-sm" style="width: 18rem; margin-top: 4rem">
											<div class="card-body" style="background-color: #8da3d9">
												<div class="form-outline form-white mb-4">
													<input type="text" id="Name" placeholder="Display name" class="inputSingUp form-control form-control-lg"/>
												</div>
												<div class="form-outline form-white mb-4">
													<input type="file" id="UserImage name="UserImage" accept="image/*" class="form-control form-control-lg"/>
												</div>
												<a id="saveDataUserButton" class="btn btn-primary">Save</a>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="col">
							<div class="container fs-3 mx-auto" style="margin-top: 4rem;">
								<div class="row justify-content-center">
        							<div class="col-12">
										<ol class="list-group">
											<li class="list-group-item d-flex justify-content-around" style="background-color: #5272c1;">
												<div class="p-2">Name</div>
												<div class="p-2">Win/loss</div>
												<div class="p-2">Result</div>
											</li>
											<li class="list-group-item d-flex justify-content-around" style="background-color: #8da3d9;">
												<div class="p-2">Name</div>
												<div class="p-2">Win/loss</div>
												<div class="p-2">Result</div>
											</li>
											<li class="list-group-item d-flex justify-content-around" style="background-color: #8da3d9;">
												<div class="p-2">Name</div>
												<div class="p-2">Win/loss</div>
												<div class="p-2">Result</div>
											</li>
											<li class="list-group-item d-flex justify-content-around" style="background-color: #8da3d9;">
												<div class="p-2">Name</div>
												<div class="p-2">Win/loss</div>
												<div class="p-2">Result</div>
											</li>
											<li class="list-group-item d-flex justify-content-around" style="background-color: #8da3d9;">
												<div class="p-2">Name</div>
												<div class="p-2">Win/loss</div>
												<div class="p-2">Result</div>
											</li>
											<li class="list-group-item d-flex justify-content-around" style="background-color: #8da3d9;">
												<div class="p-2">Name</div>
												<div class="p-2">Win/loss</div>
												<div class="p-2">Result</div>
											</li>
										</ol>
									</div>
								</div>
							</div>
						</div>
					</div
				</div>
			`;
			return page;
		})
		.catch(error => {
			console.error('Error:', error);
		});
    }
}
