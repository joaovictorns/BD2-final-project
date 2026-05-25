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
	async createTriggerCashbackZero(req, res) {
		try {
			const result = await this.service.createTriggerCashbackZero();
			res.status(201).json({ status: 'success', message: result });
		} catch (error) {
			res.status(500).json({ status: 'error', message: error.message });
		}
	}
}

export default TriggersController;
