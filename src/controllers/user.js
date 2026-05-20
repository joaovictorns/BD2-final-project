import BaseController from './base.js';
import { UserService } from '@services';

class UserController extends BaseController {
	constructor() {
		super();

		this.userService = new UserService();
		this.createUsersWithRoles = this.createUsersWithRoles.bind(this);
		this.createAdministrador = this.createAdministrador.bind(this);
	}

	async createAdministrador(req, res) {
		try {
			const response = await this.userService.createAdministrador();

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async createUsersWithRoles(req, res) {
		try {
			const response = await this.userService.createUsersWithRoles();

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

export default UserController;
