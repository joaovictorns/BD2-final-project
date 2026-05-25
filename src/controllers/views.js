import BaseController from './base.js';
import { ViewsService } from '@services';

class ViewsController extends BaseController {
	constructor() {
		super();

		this.viewsService = new ViewsService();
		this.createViews = this.createViews.bind(this);
		this.getPerformanceVendedores = this.getPerformanceVendedores.bind(this);
	}

	async createViews(req, res) {
		try {
			const response = await this.viewsService.createViews();
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async getPerformanceVendedores(req, res) {
		try {
			const response = await this.viewsService.getPerformanceVendedores();
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async getAnaliseClientesEspeciais(req, res) {
		try {
			const response = await this.viewsService.getAnaliseClientesEspeciais();
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

}

export default ViewsController;
