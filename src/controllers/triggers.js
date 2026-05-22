import BaseController from './base';
import { TriggersService } from '@services';

class TriggersController extends BaseController {
	constructor() {
		super();

		this.triggersService = new TriggersService();
		this.createTriggers = this.createTriggers.bind(this);
	}

	async createTriggers(req, res) {
		try {
			const response = await this.triggersService.createTriggers();

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

export default TriggersController;
