import Database from '@database';

export default class UserService {
	constructor() {
		this.database = new Database();
	}

	async createAdministrador() {
		try {
			return await this.database.createAdministrador();
		} catch (error) {
			throw new Error('Error creating administrador: ' + error.message);
		}
	}

	async createUsersWithRoles() {
		try {
			return await this.database.createUsersWithRoles();
		} catch (error) {
			throw new Error('Error executing user method: ' + error.message);
		}
	}
}
