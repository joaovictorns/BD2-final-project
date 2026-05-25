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

	async createVendasCategoria(req, res) {
		try {
			const result = await this.service.createVendasCategoria();
			res.status(201).json({ status: 'success', message: result });
		} catch (error) {
			res.status(500).json({ status: 'error', message: error.message });
		}
	}

	async listarVendasCategoria(req, res) {
		try {
			const result = await this.service.listarVendasCategoria();
			res.status(200).json({ status: 'success', data: result });
		} catch (error) {
			res.status(500).json({ status: 'error', message: error.message });
		}
	}

}

export default ViewsController;
