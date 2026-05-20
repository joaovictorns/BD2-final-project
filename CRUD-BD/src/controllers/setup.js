import BaseController from './base.js';
import { SetupService } from '@services';

class SetupController extends BaseController {
	constructor() {
		super();

		this.setupService = new SetupService();
		this.initDatabase = this.initDatabase.bind(this);
		this.dropDatabase = this.dropDatabase.bind(this);
	}

	async initDatabase(req, res) {
		try {
			const response = await this.setupService.initDatabase();

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async dropDatabase(req, res) {
		try {
			const response = await this.setupService.dropDatabase();

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

export default SetupController;
