
import BaseRoutes from './base';
import { FunctionsController } from '@controllers';

class FunctionsRoutes extends BaseRoutes {
	constructor() {
		super();
		this.functionsController = new FunctionsController();
	}

	setup() {
		this.router.post('/reajuste',
			this.functionsController.reajusteSalarial.bind(this.functionsController)
		);

		this.router.get('/sorteio',
			this.functionsController.realizarSorteio.bind(this.functionsController)
		);

		this.router.post('/venda',
			this.functionsController.realizarVenda.bind(this.functionsController)
		);

		this.router.get('/estatisticas',
			this.functionsController.getEstatisticas.bind(this.functionsController)
		);

		return this.router;
	}
}

export default FunctionsRoutes;
