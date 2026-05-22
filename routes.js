import { Router } from 'express';
import { SetupRoutes, UserRoutes, TriggersRoutes, ViewsRoutes, ProceduresRoutes } from '@routes';

class Routes {
	constructor() {
		this.routes = new Router();
		this.setupRoutes = new SetupRoutes();
		this.userRoutes = new UserRoutes();
		this.triggersRoutes = new TriggersRoutes();
		this.viewsRoutes = new ViewsRoutes();
		this.proceduresRoutes = new ProceduresRoutes();
	}

	setup() {
		this.routes.get('/health', (req, res) => res.status(200).send('OK'));
		this.routes.use('/setup', this.setupRoutes.setup());
		this.routes.use('/user', this.userRoutes.setup());
		this.routes.use('/triggers', this.triggersRoutes.setup());
		this.routes.use('/views', this.viewsRoutes.setup());
		this.routes.use('/procedures', this.proceduresRoutes.setup());
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
