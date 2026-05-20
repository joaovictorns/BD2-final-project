import Sequelize from 'sequelize';

class Database {
	constructor() {
		this.databaseOptions = {
			dialect: 'postgres',
			port: parseInt(process.env.DB_PORT) || 5432,
			logging: false,
			pool: {
				max: 10,
				min: 5,
				idle: 10000,
				acquire: 30000
			},
			query: {
				raw: false
			},
			dialectOptions: {},
			underscored: false
		};

		this.masterInstance = this._masterInstance();
	}

	_masterInstance() {
		return new Sequelize(
			process.env.DB_NAME,
			process.env.DB_USER,
			process.env.DB_PASSWORD,
			{
				host: process.env.DB_HOST,
				...this.databaseOptions
			}
		);
	}

	_authenticate() {
		return this.masterInstance.authenticate();
	}

	disconnect() {
		return this.masterInstance.close()
			.then(() => console.log('Database is disconnected.'))
			.catch(error => console.log(`Database disconnection error: ${error}`));
	}

	connect() {
		return this._authenticate();
	}
}

export default Database;
