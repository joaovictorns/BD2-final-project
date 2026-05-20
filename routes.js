import { Router } from 'express';
import { SetupRoutes } from '@routes';

class Routes {
	constructor() {
		this.routes = new Router();
		this.setupRoutes = new SetupRoutes();
	}

	setup() {
		this.routes.get('/health', (req, res) => res.status(200).send('OK'));
		this.routes.use('/setup', this.setupRoutes.setup());
		this.routes.use((error, req, res, next) => {
			if (error) {
				res.status(500).json({
					status: 'error',
					message: 'Algo de errado aconteceu'
				});
				return;
			}

			next();
		});

		return this.routes;
	}
}

export default Routes;
