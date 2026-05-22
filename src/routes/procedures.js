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

		return this.router;
	}
}

export default ProceduresRoutes;
