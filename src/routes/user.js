import BaseRoutes from './base.js';
import { UserController } from '@controllers';

class UserRoutes extends BaseRoutes {
	constructor() {
		super();
		this.userController = new UserController();
	}

	setup() {
		this.router.post('/create',
			this.userController.createUsersWithRoles
		);

		this.router.post('/administrador',
			this.userController.createAdministrador
		);

		this.router.post('/gerente',
			this.userController.createGerente
		);

		return this.router;
	}
}

export default UserRoutes;
