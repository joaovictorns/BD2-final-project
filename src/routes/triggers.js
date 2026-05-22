import BaseRoutes from './base';
import { TriggersController } from '@controllers';

class TriggersRoutes extends BaseRoutes {
	constructor() {
		super();
		this.triggersController = new TriggersController();
	}

	setup() {
		this.router.post('/create',
			this.triggersController.createTriggers
		);

		return this.router;
	}
}

export default TriggersRoutes;
