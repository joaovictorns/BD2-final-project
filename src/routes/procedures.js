import BaseRoutes from './base';
import { ProceduresController } from '@controllers';

class ProceduresRoutes extends BaseRoutes {
	constructor() {
		super();
		this.proceduresController = new ProceduresController();
	}

	setup() {
		this.router.post('/create', this.proceduresController.createProcedures);
		this.router.post('/reajuste', this.proceduresController.reajusteSalarial);
		this.router.post('/sorteio', this.proceduresController.sorteioCliente);
		this.router.post('/venda', this.proceduresController.realizarVenda);
		this.router.get('/estatisticas', this.proceduresController.estatisticasVendas);

		return this.router;
	}
}

export default ProceduresRoutes;
