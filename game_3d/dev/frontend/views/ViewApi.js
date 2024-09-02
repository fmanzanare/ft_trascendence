import AbstractView from "./AbstractView.js";
import { login42 } from "../helpers/login.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Login");
    }
    async getHtml() {
        let page = `
			<div class="d-flex flex-column justify-content-center align-items-center h-100">
				<div class="spinner-border" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
			</div>
		`
		return page;
	}
}