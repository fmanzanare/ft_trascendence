import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Profile");
    }

	async getHtml() {
        const $token = sessionStorage.getItem('pongToken');

        const fetchTwoFactor = async () => {
            const $twoFactorUrl = apiUrl + 'get2fa/';
            const response = await fetch($twoFactorUrl, {
                method: "GET",
                headers: { "Authorization": $token }
            });

            if (!response.ok) {
                throw new Error('Hubo un problema al realizar la solicitud.');
            }
            const data = await response.json();
            return data.context.key;
        };

        const fetchHistory = async () => {
			const $userId = sessionStorage.getItem("userId")
			const $historyUrl = `${apiUrl}user_history/?userId=${encodeURIComponent($userId)}`
            const response = await fetch($historyUrl, {
                method: "GET",
                headers: { "Authorization": $token }
            });

            if (!response.ok) {
                throw new Error('Hubo un problema al realizar la solicitud.');
            }
            const data = await response.json();
            return data.history;
        };

        const fetchProfile = async () => {
            const $profileUrl = apiUrl + 'profile/';
            const response = await fetch($profileUrl, {
                method: "GET",
                headers: { "Authorization": $token }
            });

            if (!response.ok) {
                throw new Error('Hubo un problema al realizar la solicitud.');
            }
            const data = await response.json();
            return data;
        };

        try {
            const twoFactor = await fetchTwoFactor();
            const historyData = await fetchHistory();
            const data = await fetchProfile();

			let page =
			`
				<div class="container-fluid py-10 h-100">
					<div class="row d-flex justify-content-center align-items-center" style="height:20vh">
						<h1 class="display-1 fw-bold mb-3 text-uppercase text-center" style="color:#80dbef;">Profile</h1>	
					</div>
					<div class="tab-content" id="myTabContent">
						<div class="container mt-3">
							<ul class="nav nav-tabs" id="myTab" role="tablist">
								<li class="nav-item">
									<a class="nav-link active" id="infoTab" data-toggle="tab" role="button" aria-controls="info" aria-selected="true">Info</a>
								</li>
								<li class="nav-item">
									<a class="nav-link" id="historyTab" data-toggle="tab" role="button" aria-controls="history" aria-selected="false">History</a>
								</li>
							</ul>
							<div class="tab-content" id="myTabContent">
								<div class="tab-pane fade show active" id="infoProfile" role="tabpanel" aria-labelledby="infoTab">
									<div class="container mt-4">
										<div class="row">
											<div class="col-md-6">
											`
											if (data.context.user.avatar_base64 == "")
												page += ` <img src="./dev/frontend/assets/homerSimpson.webp" class="max-width-75" alt="profile picture">`
											else
												page += ` <img src="${data.context.user.avatar_base64}" class="max-width-75" alt="profile picture">`
											page +=
											`
											</div>
										<div class="col-md-6 d-flex flex-column" style="color:white" id="dataUserShow">
											<h2>${data.context.user.username}</h2>
											<p>${data.context.points}</p>
											<div class="form-check form-switch">
			`
			if (data.context.user.has_2fa)
			{
				page += ` 	<input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" checked disabled >
							<label class="form-check-label" for="flexSwitchCheckChecked">two-factor authentication</label>
							</div>
							<canvas id="qrCode" style="max-width: 200px"></canvas>`
			}
			else
				page += ` 	<input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" disabled >
							<label class="form-check-label" for="flexSwitchCheckChecked">two-factor authentication</label>
							</div>`
			page +=
			`
											<button class="btn btn-primary mt-2" style="max-width: 200px" id="changeDataView">Change data</button>
										</div>
										<div class="d-none col-md-6" id="dataUserChange" style="color:white">
											<div class="form-outline form-white mb-4">
												<input type="text" id="UserNameChange" placeholder="Username" class="inputSingUp form-control form-control-lg"/>
											</div>
											<div class="form-outline form-white mb-4" style="color:white">
												<label for="profilePictureChange">New profile picture:</label>
												<input type="file" class="form-control-file" id="profilePictureChange" name="profilePicture">
											</div>
											<div class="form-check form-switch">
			`
			if (data.context.user.has_2fa)
			{
				page += `	<input class="form-check-input" type="checkbox" role="switch" id="checkChecked" checked>
							<label class="form-check-label" for="checkChecked">two-factor authentication</label>`
			}
			else
			{
				page += `	<input class="form-check-input" type="checkbox" role="switch" id="checkUnchecked">
							<label class="form-check-label" for="checkUnchecked">two-factor authentication</label>`
			}
			page +=
			`
											</div>
											<button class="btn btn-primary" id="changeDataUser">Save</button>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="d-none tab-pane fade" id="historyProfile" role="tabpanel" aria-labelledby="history-tab">
							<div class="container fs-3 mx-auto" style="margin-top: 4rem;">
								<div class="row justify-content-center">
									<div class="col-12">
										<ol class="list-group">
											<li class="list-group-item d-flex justify-content-around" style="background-color: #5272c1;">
												<div class="col p-2 text-center">Name</div>
												<div class="col p-2 text-center">Win/loss</div>
												<div class="col p-2 text-center">Result</div>
											</li>
											${historyData.slice(-5).reverse().map(item => `
												<li class="list-group-item d-flex justify-content-around" style="background-color: #8da3d9;">
													<div class="col p-2 text-center" onClick="goToUserProfile(${item.idRival})" style="cursor: pointer;">${item.rival}</div>
													<div class="col p-2 text-center">${item.isWin ? 'Win' : 'Loss'}</div>
													<div class="col p-2 text-center">${item.myScore} - ${item.myRivalScore}</div>
												</li>
											`).join('')}
										</ol>
									</div>
								</div>
							</div>
						</div>
    				</div>
				</div>
			`;

			return page;
        } catch (error) {
            console.error('Error:', error);
        }
    }
}