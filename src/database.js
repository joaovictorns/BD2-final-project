import Sequelize from 'sequelize';

class Database {
	constructor() {
		this.databaseOptions = {
			dialect: 'postgres',
			port: parseInt(process.env.DB_PORT) || 5000,
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

	_getConnection(database) {
		return new Sequelize(database, process.env.DB_USER, process.env.DB_PASSWORD, {
			host: process.env.DB_HOST,
			port: parseInt(process.env.DB_PORT) || 5000,
			dialect: 'postgres',
			logging: false
		});
	}

	async createAdministrador() {
		const serverConn = this._getConnection('postgres');

		try {
			await serverConn.query(`
				DO $$
				BEGIN
					IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'db_administrador') THEN
						CREATE ROLE db_administrador WITH LOGIN PASSWORD 'admin123' SUPERUSER;
					END IF;
				END
				$$;
			`);

			return 'Administrador criado com sucesso: db_administrador (superuser)';
		} finally {
			await serverConn.close();
		}
	}

	async createGerente() {
		const serverConn = this._getConnection('postgres');
		const appConn = this._getConnection(process.env.DB_NAME);

		try {
			await serverConn.query(`
				DO $$
				BEGIN
					IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'db_gerente') THEN
					CREATE ROLE db_gerente WITH LOGIN PASSWORD 'gerente123';
					END IF
				END $$;
			`);
			
			await appConn.query(`
				GRANT CONNECT ON DATABASE "${process.env.DB_NAME}" TO db_gerente;
				GRANT USAGE ON SCHEMA public TO db_gerente;
				GRANT SELECT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO db_gerente;	
			`);

			return 'Role db_gerente criada com grants';
		} finally {
			await serverConn.close();
			await appConn.close();
		}
	}

	async createUsersWithRoles() {
		return this.createAdministrador();
	}
}

export default Database;
