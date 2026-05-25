import Database from '@database';
import Sequelize from 'sequelize';
export default class ProceduresService {
	constructor() {
		this.database = new Database();
		this.connection = new Sequelize(
			process.env.DB_NAME,
			process.env.DB_USER,
			process.env.DB_PASSWORD,
			{
				host: process.env.DB_HOST,
				port: process.env.DB_PORT || 5000,
				dialect: 'postgres',
				logging: false
			}
		);
	}

	async createProcedures() {
		try {
			await this.connection.query(`
				CREATE OR REPLACE PROCEDURE reajuste_salarial(
					percentual NUMERIC,
					categoria VARCHAR
				)
				LANGUAGE plpgsql
				AS $$
				BEGIN
					UPDATE funcionario
					SET salario = salario * (1 + percentual/100)
					WHERE cargo = categoria;
				END;
				$$;
			`);

			// Procedure de sorteio
			await this.connection.query(`
				CREATE OR REPLACE PROCEDURE sorteio_cliente(
					OUT cliente_id INTEGER,
					OUT valor_voucher NUMERIC
				)
				LANGUAGE plpgsql
				AS $$
				DECLARE
					cliente_especial BOOLEAN;
				BEGIN
					SELECT id INTO cliente_id
					FROM cliente
					ORDER BY RANDOM()
					LIMIT 1;
					SELECT EXISTS(
						SELECT 1 FROM clienteespecial WHERE id_cliente = cliente_id
					) INTO cliente_especial;
					IF cliente_especial THEN
						valor_voucher := 200;
					ELSE
						valor_voucher := 100;
					END IF;
				END;
				$$;
			`);

			// Procedure de venda

			// Procedure de estatísticas

			return 'Procedures created successfully';
		} catch (error) {
			throw new Error('Error creating procedures: ' + error.message);
		}
	}

	async reajusteSalarial(percentual, categoria) {
		const connection = this.connection;
		await connection.query('CALL reajuste_salarial(:percentual, :categoria)', {
			replacements: { percentual, categoria }
		});
		return 'Reajuste aplicado com sucesso';
	}

	async estatisticasVendas() {
		const connection = await this.connection;
		const [result] = await connection.query('CALL estatisticas_vendas(NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);');
		return result;
	}

	async sorteioCliente() {
		const connection = this.connection;
		const [result] = await connection.query('CALL sorteio_cliente(NULL, NULL);');
		return result;
	}
}
