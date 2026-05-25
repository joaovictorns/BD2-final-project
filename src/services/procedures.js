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
			await this.connection.query(`
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
			await this.connection.query(`
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

	async sorteioCliente() {
		const connection = this.connection;
		const [result] = await connection.query('CALL sorteio_cliente(NULL, NULL);');
		return result;
	}

	async realizarVenda(id_vendedor, id_cliente, id_produto, id_transportadora, endereco_destino, valor_cobrado) {
		const connection = await this.connection;
		await connection.query('CALL realizar_venda(:id_vendedor, :id_cliente, :id_produto, :id_transportadora, :endereco_destino, :valor_cobrado)', {
			replacements: { id_vendedor, id_cliente, id_produto, id_transportadora: id_transportadora || null, endereco_destino: endereco_destino || null, valor_cobrado: valor_cobrado || null }
		});

		return 'Venda realizada com sucesso';
	}

	async estatisticasVendas() {
		const connection = await this.connection;
		const [result] = await connection.query('CALL estatisticas_vendas(NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);');
		return result;
	}
}
