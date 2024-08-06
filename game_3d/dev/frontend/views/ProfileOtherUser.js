import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
		this.userId = params.userId; 
        this.setTitle("Profile");
    }

	async getHtml() {
        const $token = sessionStorage.getItem('pongToken');

		const fetchProfileUser = async (userId) => {
			const $profileUrl = `${apiUrl}profile_id/?userId=${encodeURIComponent(userId)}`
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

		const fetchHistory = async (userId) => {
			const $historyUrl = `${apiUrl}user_history/?userId=${encodeURIComponent(userId)}`
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

		try {
			const data = await fetchProfileUser(this.userId);
			const historyData = await fetchHistory(this.userId);
			let status;
			let statusColor;
			console.log(data);
			switch (data.context.user.status){
				case "ON":
					status = "online";
					statusColor = "green";
					break;
				case "OFF":
					status = "offline";
					statusColor = "gray";
					break;
				default:
					status = "In game";
					statusColor = "red";
					break;
			}
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
												page += ` <img src="../dev/frontend/assets/homerSimpson.webp" class="max-width-75" alt="profile picture">`
											else
												page += ` <img src="${data.context.user.avatar_base64}" class="max-width-75" alt="profile picture">`
											page +=
											`
										</div>
										<div class="col-md-6 d-flex flex-column" style="color:white" id="dataUserShow">
											<h2>${data.context.user.display_name}</h2>
											<h2 style="color:${statusColor}">${status}</h2>
											<p>${data.context.user.puntos}</p>
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
				</div>
			</div>
			`
			return page;
        } catch (error) {
            console.error('Error:', error);
        }
    }
}