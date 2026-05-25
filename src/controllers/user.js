import BaseController from './base';
import { UserService } from '@services';

class UserController extends BaseController {
	constructor() {
		super();

		this.userService = new UserService();
		this.createUsersWithRoles = this.createUsersWithRoles.bind(this);
		this.createAdministrador = this.createAdministrador.bind(this);
		this.createGerente = this.createGerente.bind(this);
		this.createFuncionario = this.createFuncionario.bind(this);
	}

	async createUsersWithRoles(req, res) {
		try {
			const response = await this.userService.createUsersWithRoles();

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async createAdministrador(req, res) {
		try {
			const response = await this.userService.createAdministrador();

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async createGerente(req, res) {
		try {
			const response = await this.userService.createGerente();

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async createFuncionario(req, res) {
		try {
			const response = await this.userService.createFuncionario();

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

export default UserController;
