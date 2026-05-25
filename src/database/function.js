import Database from '@database';
import Sequelize from 'sequelize';

export default class DatabaseFunctions {
	constructor() {
		this.database = new Database();
	}

	async _getConnection() {
		return new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
			host: process.env.DB_HOST,
			port: parseInt(process.env.DB_PORT) || 5000,
			dialect: 'postgres',
			logging: false
		});
	}

	async createTriggers() {
		const connection = await this._getConnection();
		try {
			// Trigger para vendedor que vende mais de R$1000
			await connection.query(`
			CREATE OR REPLACE FUNCTION check_vendedor_vendas()
			RETURNS TRIGGER AS $$
			DECLARE
				total_vendas NUMERIC;
				bonus NUMERIC;
				total_bonus NUMERIC;
			BEGIN
				-- Calcula total de vendas do vendedor
				SELECT COALESCE(SUM(p.valor), 0) INTO total_vendas
				FROM venda v
				JOIN produto p ON v.id_produto = p.id
				WHERE v.id_vendedor = NEW.id_vendedor;

				IF total_vendas > 1000 THEN
					-- Calcula bônus (5% do valor vendido)
					bonus := total_vendas * 0.05;

					-- Insere ou atualiza funcionário especial
					INSERT INTO funcionario_especial (id_funcionario, bonus)
					VALUES (NEW.id_vendedor, bonus)
					ON CONFLICT (id_funcionario)
					DO UPDATE SET bonus = funcionario_especial.bonus + EXCLUDED.bonus;

					-- Calcula total de bônus a ser pago
					SELECT SUM(fe.bonus) INTO total_bonus FROM funcionario_especial fe;

					-- Emite mensagem
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

			// Trigger para cliente que compra mais de R$500
			await connection.query(`
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
				-- Calcula cashback (2% do valor gasto)
				cashback := total_compras * 0.02;

				-- Insere ou atualiza cliente especial
				INSERT INTO clienteespecial (id_cliente, nome, sexo, idade, nascimento, cashback)
				VALUES (NEW.id_cliente, v_nome, v_sexo, v_idade, v_nascimento, cashback)
				ON CONFLICT (id_cliente)
				DO UPDATE SET cashback = clienteespecial.cashback + EXCLUDED.cashback;

					-- Calcula total de cashback a ser pago
					SELECT SUM(cashback) INTO total_cashback FROM clienteespecial;

					-- Emite mensagem
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

			await connection.query(`
			CREATE OR REPLACE FUNCTION check_cashback_zero()
			RETURNS TRIGGER AS $$
			BEGIN
				IF NEW.cashback <= 0 THEN
					DELETE FROM clienteespecial WHERE id_cliente = NEW.id_cliente;
				END IF;
				RETURN NEW;
			END;
			$$ LANGUAGE plpgsql;

			DROP TRIGGER IF EXISTS trg_check_cashback_zero ON clienteespecial;
			CREATE TRIGGER trg_check_cashback_zero
			AFTER UPDATE ON clienteespecial
			FOR EACH ROW
			EXECUTE FUNCTION check_cashback_zero();
			`);

		} finally {
			await connection.close();
		}
	}

	async createProcedures() {
		const connection = await this._getConnection();
		try {
			// Procedure de reajuste salarial
			await connection.query(`
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
			await connection.query(`
			CREATE OR REPLACE PROCEDURE sorteio_cliente(
				OUT cliente_id INTEGER,
				OUT valor_voucher NUMERIC
			)
			LANGUAGE plpgsql
			AS $$
			DECLARE
				cliente_especial BOOLEAN;
			BEGIN
				-- Sorteia cliente aleatório
				SELECT id INTO cliente_id
				FROM cliente
				ORDER BY RANDOM()
				LIMIT 1;

				-- Verifica se é cliente especial
				SELECT EXISTS(
					SELECT 1 FROM clienteespecial WHERE id_cliente = cliente_id
				) INTO cliente_especial;

				-- Define valor do voucher
				IF cliente_especial THEN
					valor_voucher := 200;
				ELSE
					valor_voucher := 100;
				END IF;
			END;
			$$;
			`);

			// Procedure de venda
			await connection.query(`
		CREATE OR REPLACE PROCEDURE realizar_venda(
			p_id_vendedor INTEGER,
			p_id_cliente INTEGER,
			p_id_produto INTEGER,
			p_id_transportadora INTEGER DEFAULT NULL,
			p_endereco_destino VARCHAR DEFAULT NULL,
			p_valor_cobrado NUMERIC DEFAULT NULL
		)
		LANGUAGE plpgsql
		AS $$
		BEGIN
			INSERT INTO venda (id_vendedor, id_cliente, id_produto, id_transportadora, endereco_destino, valor_cobrado, data)
			VALUES (p_id_vendedor, p_id_cliente, p_id_produto, p_id_transportadora, p_endereco_destino, p_valor_cobrado, NOW());

			UPDATE produto
			SET quantidade = quantidade - 1
			WHERE id = p_id_produto;
		END;
		$$;
		`);

			// Procedure de estatísticas
			await connection.query(`
		CREATE OR REPLACE PROCEDURE estatisticas_vendas(
			OUT produto_mais_vendido VARCHAR,
			OUT vendedor_mais_vendas VARCHAR,
			OUT produto_menos_vendido VARCHAR,
			OUT valor_mais_vendido NUMERIC,
			OUT mes_maior_mais INTEGER,
			OUT mes_menor_mais INTEGER,
			OUT valor_menos_vendido NUMERIC,
			OUT mes_maior_menos INTEGER,
			OUT mes_menor_menos INTEGER
		)
		LANGUAGE plpgsql
		AS $$
		BEGIN
			-- Produto mais vendido e valor total
			SELECT p.nome, SUM(p.valor)
			INTO produto_mais_vendido, valor_mais_vendido
			FROM venda v
			JOIN produto p ON v.id_produto = p.id
			GROUP BY p.id, p.nome
			ORDER BY COUNT(*) DESC
			LIMIT 1;

			-- Vendedor associado ao produto mais vendido
			SELECT f.nome INTO vendedor_mais_vendas
			FROM venda v
			JOIN funcionario f ON v.id_vendedor = f.id
			JOIN produto p ON v.id_produto = p.id
			WHERE p.nome = produto_mais_vendido
			GROUP BY f.id, f.nome
			ORDER BY COUNT(*) DESC
			LIMIT 1;

			-- Produto menos vendido e valor total
			SELECT p.nome, SUM(p.valor)
			INTO produto_menos_vendido, valor_menos_vendido
			FROM venda v
			JOIN produto p ON v.id_produto = p.id
			GROUP BY p.id, p.nome
			ORDER BY COUNT(*) ASC
			LIMIT 1;

			-- Mês de maior e menor vendas do produto MAIS vendido
			SELECT EXTRACT(MONTH FROM v.data)::INTEGER
			INTO mes_maior_mais
			FROM venda v
			JOIN produto p ON v.id_produto = p.id
			WHERE p.nome = produto_mais_vendido
			GROUP BY EXTRACT(MONTH FROM v.data)
			ORDER BY COUNT(*) DESC
			LIMIT 1;

			SELECT EXTRACT(MONTH FROM v.data)::INTEGER
			INTO mes_menor_mais
			FROM venda v
			JOIN produto p ON v.id_produto = p.id
			WHERE p.nome = produto_mais_vendido
			GROUP BY EXTRACT(MONTH FROM v.data)
			ORDER BY COUNT(*) ASC
			LIMIT 1;

			-- Mês de maior e menor vendas do produto MENOS vendido
			SELECT EXTRACT(MONTH FROM v.data)::INTEGER
			INTO mes_maior_menos
			FROM venda v
			JOIN produto p ON v.id_produto = p.id
			WHERE p.nome = produto_menos_vendido
			GROUP BY EXTRACT(MONTH FROM v.data)
			ORDER BY COUNT(*) DESC
			LIMIT 1;

			SELECT EXTRACT(MONTH FROM v.data)::INTEGER
			INTO mes_menor_menos
			FROM venda v
			JOIN produto p ON v.id_produto = p.id
			WHERE p.nome = produto_menos_vendido
			GROUP BY EXTRACT(MONTH FROM v.data)
			ORDER BY COUNT(*) ASC
			LIMIT 1;
		END;
		$$;
		`);

		} finally {
			await connection.close();
		}
	}

	async createViews() {
		const connection = await this._getConnection();
		try {
			// View 1: Vendas por vendedor com total
			await connection.query(`
			CREATE OR REPLACE VIEW vendas_por_vendedor AS
			SELECT
				f.nome as vendedor,
				f.cargo,
				COUNT(v.id) as total_vendas,
				SUM(p.valor) as valor_total
			FROM funcionario f
			LEFT JOIN venda v ON f.id = v.id_vendedor
			LEFT JOIN produto p ON v.id_produto = p.id
			GROUP BY f.id, f.nome, f.cargo;
			`);

			// View 2: Clientes especiais com total de compras
			await connection.query(`
			CREATE OR REPLACE VIEW clientes_especiais_compras AS
			SELECT
				c.nome as cliente,
				ce.cashback,
				COUNT(v.id) as total_compras,
				SUM(p.valor) as valor_total
			FROM cliente c
			JOIN clienteespecial ce ON c.id = ce.id_cliente
			LEFT JOIN venda v ON c.id = v.id_cliente
			LEFT JOIN produto p ON v.id_produto = p.id
			GROUP BY c.id, c.nome, ce.cashback;
			`);

			// View 3: Produtos mais vendidos por mês
			await connection.query(`
			CREATE OR REPLACE VIEW produtos_por_mes AS
			SELECT
				p.nome as produto,
				EXTRACT(MONTH FROM v.data) as mes,
				COUNT(v.id) as quantidade_vendida,
				SUM(p.valor) as valor_total
			FROM produto p
			LEFT JOIN venda v ON p.id = v.id_produto
			GROUP BY p.id, p.nome, EXTRACT(MONTH FROM v.data)
			ORDER BY mes, quantidade_vendida DESC;
			`);

		} finally {
			await connection.close();
		}
	}
}
