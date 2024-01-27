import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Profile");
    }

    async getHtml() {
        return `
			<div class="container py-5 h-100">
				<div class="row d-flex justify-content-center align-items-center h-100">
					<h1 class="display-1 fw-bold mb-3 text-uppercase text-center" style="color:#80dbef;">Profile</h1>
				</div>
			</div>
		`;
    }
}
