import BaseController from './base';
import { ProceduresService } from '@services';

class ProceduresController extends BaseController {
	constructor() {
		super();

		this.proceduresService = new ProceduresService();
		this.createProcedures = this.createProcedures.bind(this);
		this.reajusteSalarial = this.reajusteSalarial.bind(this);
	}

	async createProcedures(req, res) {
		try {
			const response = await this.proceduresService.createProcedures();

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async reajusteSalarial(req, res) {
		try {
			const { percentual, categoria } = req.body;
			const response = await this.proceduresService.reajusteSalarial(percentual, categoria);
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async sorteioCliente() {
		try {
			const response = await this.proceduresService.sorteioCliente();

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

export default ProceduresController;
