import Database from '@database';

export default class UserService {
	constructor() {
		this.database = new Database();
	}

	async createUsersWithRoles() {
		try {
			await this.database.createUsersWithRoles();
			return 'User method executed';
		} catch (error) {
			throw new Error("Error executing user method: " + error.message );
		}
	}
}
