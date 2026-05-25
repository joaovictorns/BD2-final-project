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

			await this.connection.query(`
				CREATE OR REPLACE FUNCTION check_cliente_compras()
				RETURNS TRIGGER AS $$
				DECLARE
					total_compras NUMERIC;
					cashback NUMERIC;
					total_cashback NUMERIC;
					v_nome VARCHAR(255);
					v_sexo CHAR(1);
					v_idade INTEGER;
					v_nascimento DATE;
				BEGIN
					-- Busca os dados do cliente
					SELECT nome, sexo, idade, nascimento INTO v_nome, v_sexo, v_idade, v_nascimento FROM cliente WHERE id = NEW.id_cliente;
	
					-- Calcula total de compras do cliente
					SELECT COALESCE(SUM(p.valor), 0) INTO total_compras
					FROM venda v
					JOIN produto p ON v.id_produto = p.id
					WHERE v.id_cliente = NEW.id_cliente;
	
					IF total_compras > 500 THEN
						cashback := total_compras * 0.02;
	
						-- Insere ou atualiza cliente especial com todos os campos obrigatórios
						INSERT INTO clienteespecial (id_cliente, nome, sexo, idade, nascimento, cashback)
						VALUES (NEW.id_cliente, v_nome, v_sexo, v_idade, v_nascimento, cashback)
						ON CONFLICT (id_cliente)
						DO UPDATE SET cashback = clienteespecial.cashback + EXCLUDED.cashback;
	
						SELECT SUM(ce.cashback) INTO total_cashback FROM clienteespecial ce;
						RAISE NOTICE 'Total de cashback a ser pago: R$%', total_cashback;
					END IF;
					RETURN NEW;
				END;
				$$ LANGUAGE plpgsql;
	
				DROP TRIGGER IF EXISTS trg_check_cliente_compras ON venda;
				CREATE TRIGGER trg_check_cliente_compras
				AFTER INSERT ON venda
				FOR EACH ROW
				EXECUTE FUNCTION check_cliente_compras();
				`);

			return 'Triggers criados com sucesso!';
		} catch (error) {
			throw new Error('Erro ao criar triggers: ' + error.message);
		}
	}
	async createTriggerCashbackZero() {
		return this.database.query(`
    CREATE OR REPLACE FUNCTION check_cashback_zero()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.cashback < 0 THEN
        NEW.cashback := 0;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS check_cashback_zero ON clienteespecial;
    CREATE TRIGGER check_cashback_zero
      BEFORE UPDATE ON clienteespecial
      FOR EACH ROW EXECUTE FUNCTION check_cashback_zero();
  `);
	}
}
