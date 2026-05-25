import BaseController from './base';
import { UserService } from '@services';

class UserController extends BaseController {
	constructor() {
		super();

		this.userService = new UserService();
		this.createUsersWithRoles = this.createUsersWithRoles.bind(this);
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
