import BaseController from './base';
import { ViewsService } from '@services';

class ViewsController extends BaseController {
	constructor() {
		super();

		this.viewsService = new ViewsService();
		this.createViews = this.createViews.bind(this);
		this.getVendasCategoriaIdade = this.getVendasCategoriaIdade.bind(this);
		this.getPerformanceVendedores = this.getPerformanceVendedores.bind(this);
		this.getAnaliseClientesEspeciais = this.getAnaliseClientesEspeciais.bind(this);
	}

	async createViews(req, res) {
		try {
			const response = await this.viewsService.createViews();
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async getVendasCategoriaIdade(req, res) {
		try {
			const response = await this.viewsService.getVendasCategoriaIdade();
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
