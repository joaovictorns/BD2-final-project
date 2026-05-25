import BaseRoutes from './base';
import { SetupController } from '@controllers';

class SetupRoutes extends BaseRoutes {
	constructor() {
		super();
		this.setupController = new SetupController();
	}

	setup() {
		this.router.post('/init-database',
			this.setupController.initDatabase
		);

		this.router.delete('/drop-database',
			this.setupController.dropDatabase
		);

		this.router.post('/create-product',
			this.setupController.createProduct
		);

		this.router.post('/create-client',
			this.setupController.createClient
		);

		return this.router;
	}
}

export default SetupRoutes;
