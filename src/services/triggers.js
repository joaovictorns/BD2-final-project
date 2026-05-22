import Sequelize from 'sequelize';

export default class TriggersService {
	constructor() {
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

	async createTriggers() {
		try {
			const result = await this.connection.query(
				'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = \'venda\';'
			);
			const tables = Array.isArray(result[0]) ? result[0] : result;
			if (!tables || tables.length === 0) {
				throw new Error('A tabela \'venda\' não existe. Rode o setup do banco antes de criar os triggers.');
			}

			await this.connection.query(`
			CREATE OR REPLACE FUNCTION check_vendedor_vendas()
			RETURNS TRIGGER AS $$
			DECLARE
				total_vendas NUMERIC;
				bonus NUMERIC;
				total_bonus NUMERIC;
			BEGIN
				SELECT COALESCE(SUM(p.valor), 0) INTO total_vendas
				FROM venda v
				JOIN produto p ON v.id_produto = p.id
				WHERE v.id_vendedor = NEW.id_vendedor;

				IF total_vendas > 1000 THEN
					bonus := total_vendas * 0.05;
					INSERT INTO funcionario_especial (id_funcionario, bonus)
					VALUES (NEW.id_vendedor, bonus)
					ON CONFLICT (id_funcionario)
					DO UPDATE SET bonus = funcionario_especial.bonus + EXCLUDED.bonus;
					SELECT SUM(fe.bonus) INTO total_bonus FROM funcionario_especial fe;
					RAISE NOTICE 'Total de bônus a ser pago: R$%', total_bonus;
				END IF;
				RETURN NEW;
			END;
			$$ LANGUAGE plpgsql;

			DROP TRIGGER IF EXISTS trg_check_vendedor_vendas ON venda;
			CREATE TRIGGER trg_check_vendedor_vendas
			AFTER INSERT ON venda
			FOR EACH ROW
			EXECUTE FUNCTION check_vendedor_vendas();
			`);

			return 'Triggers criados com sucesso!';
		} catch (error) {
			throw new Error('Erro ao criar triggers: ' + error.message);
		}
	}
}
