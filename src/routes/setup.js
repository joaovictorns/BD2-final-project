import BaseRoutes from './base.js';
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

		return this.router;
	}
}

export default SetupRoutes;
