import BaseController from './base';
import { ProceduresService } from '@services';

class ProceduresController extends BaseController {
	constructor() {
		super();

		this.proceduresService = new ProceduresService();
		this.createProcedures = this.createProcedures.bind(this);
		this.reajusteSalarial = this.reajusteSalarial.bind(this);
		this.sorteioCliente = this.sorteioCliente.bind(this);
		this.realizarVenda = this.realizarVenda.bind(this);
		this.estatisticasVendas = this.estatisticasVendas.bind(this);
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

	async sorteioCliente(req, res) {
		try {
			const response = await this.proceduresService.sorteioCliente();
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async realizarVenda(req, res) {
		try {
			const { id_vendedor, id_cliente, id_produto, id_transportadora, endereco_destino, valor_cobrado } = req.body;
			const response = await this.proceduresService.realizarVenda(id_vendedor, id_cliente, id_produto, id_transportadora, endereco_destino, valor_cobrado);
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async estatisticasVendas(req, res) {
		try {
			const response = await this.proceduresService.estatisticasVendas();
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

export default ProceduresController;
