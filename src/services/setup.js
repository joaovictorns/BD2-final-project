import Database from '@database';
import Sequelize from 'sequelize';

export default class SetupService {
	constructor() {
		this.database = new Database();
	}

	async _getMasterConnection() {
		return new Sequelize('postgres', process.env.DB_USER, process.env.DB_PASSWORD, {
			host: process.env.DB_HOST,
			port: parseInt(process.env.DB_PORT) || 5432,
			dialect: 'postgres',
			logging: false
		});
	}

	async _getTargetConnection() {
		return new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
			host: process.env.DB_HOST,
			port: parseInt(process.env.DB_PORT) || 5432,
			dialect: 'postgres',
			logging: false
		});
	}

	async initDatabase() {
		const masterConnection = await this._getMasterConnection();
		try {
			await masterConnection.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
		} catch (error) {
			if (!error.message.includes('already exists')) throw error;
		}
		await masterConnection.close();

		const targetConnection = await this._getTargetConnection();

		try {
			await targetConnection.query(`
				CREATE TABLE cliente (
					id SERIAL PRIMARY KEY,
					nome VARCHAR(255) NOT NULL,
					sexo CHAR(1) NOT NULL CHECK (sexo IN ('m','f','o')),
					idade INTEGER NOT NULL,
					nascimento DATE NOT NULL
				);

				CREATE TABLE clienteespecial (
					id SERIAL PRIMARY KEY,
					nome VARCHAR(255) NOT NULL,
					sexo CHAR(1) NOT NULL CHECK (sexo IN ('m','f','o')),
					idade INTEGER NOT NULL,
					nascimento DATE NOT NULL,
					id_cliente INTEGER REFERENCES cliente(id) ON DELETE CASCADE,
					cashback NUMERIC(10,2) NOT NULL,
					UNIQUE (id_cliente)
				);

				CREATE TABLE funcionario (
					id SERIAL PRIMARY KEY,
					nome VARCHAR(255) NOT NULL,
					idade INTEGER NOT NULL,
					sexo CHAR(1) NOT NULL CHECK (sexo IN ('m','f','o')),
					cargo VARCHAR(20) NOT NULL CHECK (cargo IN ('vendedor','gerente','CEO')),
					causa_social VARCHAR(255),
					tipo VARCHAR(50),
					nota_media NUMERIC(3,2) DEFAULT 0.00,
					salario NUMERIC(12,2) NOT NULL,
					nascimento DATE NOT NULL
				);

				CREATE TABLE funcionario_especial (
					id SERIAL PRIMARY KEY,
					id_funcionario INTEGER REFERENCES funcionario(id) ON DELETE CASCADE,
					bonus NUMERIC(10,2) NOT NULL,
					UNIQUE (id_funcionario)
				);

				CREATE TABLE produto (
					id SERIAL PRIMARY KEY,
					nome VARCHAR(255) NOT NULL,
					quantidade INTEGER NOT NULL,
					descricao TEXT,
					valor NUMERIC(10,2) NOT NULL,
					observacoes TEXT,
					id_vendedor INTEGER REFERENCES funcionario(id) ON DELETE SET NULL
				);

				CREATE TABLE transportadora (
					id SERIAL PRIMARY KEY,
					nome VARCHAR(255) NOT NULL,
					cidade VARCHAR(255) NOT NULL
				);

				CREATE TABLE venda (
					id SERIAL PRIMARY KEY,
					id_vendedor INTEGER REFERENCES funcionario(id) ON DELETE SET NULL,
					id_cliente INTEGER REFERENCES cliente(id) ON DELETE SET NULL,
					id_produto INTEGER REFERENCES produto(id) ON DELETE SET NULL,
					id_transportadora INTEGER REFERENCES transportadora(id) ON DELETE SET NULL,
					endereco_destino VARCHAR(255),
					valor_cobrado NUMERIC(10,2),
					data TIMESTAMP NOT NULL DEFAULT NOW()
				);
				`);

			for (let i = 1; i <= 20; i++) {
				await targetConnection.query(`
				INSERT INTO produto (nome, quantidade, descricao, valor)
				VALUES ('Produto ${i}', 100, 'Descrição do produto ${i}', ${(10 + i).toFixed(2)});
				`);
			}

			const funcionarios = [
				{ nome: 'Carlos Melo', cargo: 'vendedor', causa_social: 'Educação', tipo: 'Autônomo', nota_media: 4.5 },
				{ nome: 'Ana Lima', cargo: 'vendedor', causa_social: 'Saúde', tipo: 'CLT', nota_media: 4.8 },
				{ nome: 'Bruno Costa', cargo: 'gerente', causa_social: 'Meio Ambiente', tipo: 'CLT', nota_media: 4.2 },
				{ nome: 'Mariana Souza', cargo: 'gerente', causa_social: 'Assistência Social', tipo: 'PJ', nota_media: 4.6 },
				{ nome: 'Ricardo Nunes', cargo: 'CEO', causa_social: 'Cultura', tipo: 'Sócio', nota_media: 4.9 }
			];
			for (let i = 0; i < funcionarios.length; i++) {
				const f = funcionarios[i];
				await targetConnection.query(`
				INSERT INTO funcionario (nome, idade, sexo, cargo, causa_social, tipo, nota_media, salario, nascimento)
				VALUES ('${f.nome}', ${25 + i + 1}, 'm', '${f.cargo}', '${f.causa_social}', '${f.tipo}', ${f.nota_media}, ${(3000 + (i+1)*500).toFixed(2)}, '1990-01-${(i+1).toString().padStart(2,'0')}');
				`);
			}

			const transportadoras = [
				{ nome: 'Correios', cidade: 'Brasília' },
				{ nome: 'Jadlog', cidade: 'São Paulo' },
				{ nome: 'Total Express', cidade: 'Rio de Janeiro' }
			];
			for (const t of transportadoras) {
				await targetConnection.query(`
				INSERT INTO transportadora (nome, cidade)
				VALUES ('${t.nome}', '${t.cidade}');
				`);
			}

			for (let i = 1; i <= 100; i++) {
				await targetConnection.query(`
				INSERT INTO cliente (nome, sexo, idade, nascimento)
				VALUES ('Cliente ${i}', '${i%2===0 ? 'm' : 'f'}', ${18 + (i%50)}, '2000-01-${(i%28+1).toString().padStart(2,'0')}');
				`);
			}

		} finally {
			await targetConnection.close();
		}
	}

	async dropDatabase() {
		const targetConnection = await this._getTargetConnection();

		try {
			await targetConnection.query(`
			DROP TABLE IF EXISTS venda CASCADE;
			DROP TABLE IF EXISTS transportadora CASCADE;
			DROP TABLE IF EXISTS produto CASCADE;
			DROP TABLE IF EXISTS funcionario_especial CASCADE;
			DROP TABLE IF EXISTS funcionario CASCADE;
			DROP TABLE IF EXISTS clienteespecial CASCADE;
			DROP TABLE IF EXISTS cliente CASCADE;
			`);
		} catch (error) { /* empty */ } finally {
			await targetConnection.close();
		}

		const masterConnection = await this._getMasterConnection();
		try {
			await masterConnection.query(`DROP DATABASE IF EXISTS "${process.env.DB_NAME}"`);
		} finally {
			await masterConnection.close();
		}
	}

	async createProduct(productData) {
		const { nome, quantidade, descricao, valor } = productData;

		if (!nome || !quantidade || !valor) {
			throw new Error('Nome, quantidade e valor são campos obrigatórios');
		}

		const targetConnection = await this._getTargetConnection();
		try {
			const [result] = await targetConnection.query(`
				INSERT INTO produto (nome, quantidade, descricao, valor)
				VALUES ($1, $2, $3, $4)
				RETURNING id, nome, quantidade, descricao, valor
			`, {
				bind: [nome, quantidade, descricao || null, valor],
				type: Sequelize.QueryTypes.INSERT
			});

			return result[0];
		} finally {
			await targetConnection.close();
		}
	}

	async createClient(clientData) {
		const { nome, sexo, idade, nascimento } = clientData;

		if (!nome || !sexo || !idade || !nascimento) {
			throw new Error('Nome, sexo, idade e nascimento são campos obrigatórios');
		}

		if (!['m', 'f', 'o'].includes(sexo.toLowerCase())) {
			throw new Error('Sexo deve ser m, f ou o');
		}

		const targetConnection = await this._getTargetConnection();

		try {
			const [result] = await targetConnection.query(`
				INSERT INTO cliente (nome, sexo, idade, nascimento)
				VALUES ($1, $2, $3, $4)
				RETURNING id, nome, sexo, idade, nascimento
			`, {
				bind: [nome, sexo.toLowerCase(), idade, nascimento],
				type: Sequelize.QueryTypes.INSERT
			});

			return result[0];
		} finally {
			await targetConnection.close();
		}
	}
}
