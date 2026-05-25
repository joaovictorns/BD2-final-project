import Database from '@database';

export default class UserService {
	constructor() {
		this.database = new Database();
	}

	async createUsersWithRoles() {
		try {
			return await this.database.createUsersWithRoles();
		} catch (error) {
			throw new Error('Error executing user method: ' + error.message);
		}
	}

	async createAdministrador() {
		try {
			return await this.database.createAdministrador();
		} catch (error) {
			throw new Error('Error creating administrador: ' + error.message);
		}
	}

	async createGerente() {
		try {
			return await this.database.createGerente();
		} catch (error) {
			throw new Error('Error creating gerente: ' + error.message);
		}
	}

	async createFuncionario() {
		try {
			return await this.database.createFuncionario();
		} catch (error) {
			throw new Error('Error creating funcionario: ' + error.message);
		}
	}
}
