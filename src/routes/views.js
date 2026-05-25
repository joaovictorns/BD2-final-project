import BaseRoutes from './base';
import { ViewsController } from '@controllers';

class ViewsRoutes extends BaseRoutes {
	constructor() {
		super();
		this.viewsController = new ViewsController();
	}

	setup() {
		this.router.post('/create',
			this.viewsController.createViews
		);

		this.router.get('/vendas-categoria-idade',
			this.viewsController.getVendasCategoriaIdade
		);

		this.router.get('/performance-vendedores',
			this.viewsController.getPerformanceVendedores
		);

		this.router.get('/analise-clientes-especiais',
			this.viewsController.getAnaliseClientesEspeciais
		);

		return this.router;
	}
}

export default ViewsRoutes;
