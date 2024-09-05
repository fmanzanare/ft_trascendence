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
                headers: { "Authorization": $token,
					"content-type": 'application/json'
				 }
            });

            if (!response.ok) {
                throw new Error('Unexpected error.');
            }
            const data = await response.json();
            return data;
        };

		const fetchHistory = async (userId) => {
			const $historyUrl = `${apiUrl}user_history/?userId=${encodeURIComponent(userId)}`
            const response = await fetch($historyUrl, {
                method: "GET",
                headers: { "Authorization": $token,
					"content-type": 'application/json'
				}
            });

            if (!response.ok) {
                throw new Error('Unexpected error.');
            }
            const data = await response.json();
            return data.history;
        };

		try {
			const data = await fetchProfileUser(this.userId);
			const historyData = await fetchHistory(this.userId);
			let status;
			let statusColor;
			const porGamesWins = data.context.user.games_won / data.context.user.games_played * 100
			const porTournamentsWins = data.context.user.tournaments_won / data.context.user.tournaments * 100
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
							<li class="nav-item">
								<a class="nav-link" id="statisticsTab" data-toggle="tab" role="button" aria-controls="statistics" aria-selected="false">Statistics</a>
							</li>
						</ul>
						<div class="tab-content" id="myTabContent">
							<div class="tab-pane fade show active" id="infoProfile" role="tabpanel" aria-labelledby="infoTab">
								<div class="container mt-4">
									<div class="row">
										<div class="col-md-6">
											`
											if (data.context.user.avatar_base64 == "")
												page += ` <img src="../dev/frontend/assets/homerSimpson.webp" class="rounded max-width-75" alt="profile picture">`
											else
												page += ` <img src="${data.context.user.avatar_base64}" class="rounded max-width-75" alt="profile picture">`
											page +=
											`
										</div>
										<div class="col-md-6 d-flex flex-column" style="color:white" id="dataUserShow">
											<h2>${data.context.user.display_name}</h2>
											<h2 style="color:${statusColor}">${status}</h2>
											<h5>points: ${data.context.user.puntos}</h5>
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
							<div class="d-none tab-pane fade h-100" id="statisticsProfile" role="tabpanel" aria-labelledby="statics-tab" style="color:white">
								<div class="container h-100 m-3">
								`
									if (data.context.user.games_played > 0 || data.context.user.tournaments > 0) {
										page += `
									<div class="row h-100">
										<div class="col-md-7 d-flex flex-column justify-content-start align-items-start">
											<div class="d-flex flex-row w-100 mt-4">
												<div class="me-4">
													<h5>Games played: ${data.context.user.games_played}</h5>
													<h5>Games win: ${data.context.user.games_won}</h5>
													<h5>Games loss: ${data.context.user.games_played - data.context.user.games_won} </h5>
													<h5>Tournaments played: ${data.context.user.tournaments}</h5>
													<h5>Tournaments win: ${data.context.user.tournaments_won}</h5>
													<h5>Tournaments loss: ${data.context.user.tournaments - data.context.user.tournaments_won} </h5>
												</div>
												<div class="ms-4">
													<h5>Total points scored: ${data.context.user.my_total_score} </h5>
													<h5>Total points conceded: ${data.context.user.rival_score} </h5>
													<h5>Favorite opponent: ${data.context.user.favorite_opponent} </h5>
													<h5>Most win oponent: ${data.context.user.most_won_opponent} </h5>
													<h5>Most loss oponent: ${data.context.user.most_loss_opponent} </h5>
													<h5>Last game: ${data.context.user.last_day_date} </h5>
												</div>
											</div>
										</div>
										<div class="col-md-5 d-flex flex-column justify-content-start align-items-center">
											<div class="w-100 mt-4">
												`
												if (data.context.user.games_played > 0) {
													page += `
													<h5>Games win:</h5>
													<div class="progress">
														<div class="progress-bar bg-success" role="progressbar" style="width: ${porGamesWins}%" aria-valuenow="${porGamesWins}" aria-valuemin="0" aria-valuemax="100">${porGamesWins}%</div>
														<div class="progress-bar bg-danger" role="progressbar" style="width: ${100 - porGamesWins}%" aria-valuenow="${100 - porGamesWins}" aria-valuemin="0" aria-valuemax="100">${100 - porGamesWins}%</div>
													</div>
													`
												} else {
													page += `
													<h5>Games win:</h5>
													<div class="progress">
														<div class="progress-bar" role="progressbar" style="width:100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">No games played</div>
													</div>
													`
												}
												if (data.context.user.tournaments > 0) {
													page += `
													<h5 class="mt-4">Tournaments win:</h5>
													<div class="progress">
														<div class="progress-bar bg-success" role="progressbar" style="width: ${porTournamentsWins}%" aria-valuenow="${porTournamentsWins}" aria-valuemin="0" aria-valuemax="100">${porTournamentsWins}%</div>
														<div class="progress-bar bg-danger" role="progressbar" style="width: ${100 - porTournamentsWins}%" aria-valuenow="${100 - porTournamentsWins}" aria-valuemin="0" aria-valuemax="100">${100 - porTournamentsWins}%</div>
													</div> `
												} else {
													page += `
													<h5 class="mt-4">Tournaments win:</h5>
													<div class="progress">
														<div class="progress-bar" role="progressbar" style="width:100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">No tournaments played</div>
													</div>
													`
												}
												page += 
												`
											</div>
										</div>
									</div>
									`
									} else {
										page +=
										`
											<h1 class="display-10 fw-bold text-uppercase text-center mt-5" style="color:#80dbef;">No statistics available</h1>
										`
									}
									page += `
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