import Database from '@database';
import Sequelize from 'sequelize';

export default class ViewsService {
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

	async createViews() {
		try {
			// View 1: Vendas por categoria de produto com média de idade dos clientes

			// View 2: Performance dos vendedores por mês
			await this.connection.query(`
				CREATE OR REPLACE VIEW performance_vendedores AS
				SELECT 
					f.nome as vendedor,
					f.cargo,
					EXTRACT(MONTH FROM v.data) as mes,
					COUNT(v.id) as total_vendas,
					SUM(p.valor) as valor_vendido,
					COALESCE(fe.bonus, 0) as bonus_acumulado
				FROM funcionario f
				LEFT JOIN venda v ON f.id = v.id_vendedor
				LEFT JOIN produto p ON v.id_produto = p.id
				LEFT JOIN funcionario_especial fe ON f.id = fe.id_funcionario
				WHERE f.cargo = 'vendedor'
				GROUP BY f.id, f.nome, f.cargo, mes, fe.bonus
				ORDER BY mes, valor_vendido DESC;
			`);

			// View 3: Análise de clientes especiais
			await this.connection.query(`
				CREATE OR REPLACE VIEW analise_clientes_especiais AS
				SELECT
					c.nome as cliente,
					c.sexo,
					COUNT(v.id) as total_compras,
					SUM(p.valor) as valor_total_gasto,
					ce.cashback as cashback_acumulado,
					ROUND(ce.cashback * 100.0 / SUM(p.valor), 2) as percentual_cashback
				FROM cliente c
				JOIN clienteespecial ce ON c.id = ce.id_cliente
				LEFT JOIN venda v ON c.id = v.id_cliente
				LEFT JOIN produto p ON v.id_produto = p.id
				GROUP BY c.id, c.nome, c.sexo, ce.cashback
				ORDER BY valor_total_gasto DESC;
			`);

			return 'Views created successfully!';
		} catch (error) {
			throw new Error('Error creating views: ' + error.message);
		}
	}

	async getPerformanceVendedores() {
		try {
			const [results] = await this.connection.query('SELECT * FROM performance_vendedores;');
			return results;
		} catch (error) {
			throw new Error('Error querying performance_vendedores: ' + error.message);
		}
	}

	async getAnaliseClientesEspeciais() {
		try {
			const [results] = await this.connection.query('SELECT * FROM analise_clientes_especiais;');
			return results;
		} catch (error) {
			throw new Error('Error querying analise_clientes_especiais: ' + error.message);
		}
	}

	async createVendasCategoria() {
		return this.database.query(`
    CREATE OR REPLACE VIEW vendas_categoria_idade AS
    SELECT
      p.categoria,
      CASE
        WHEN EXTRACT(YEAR FROM AGE(c.data_nascimento)) < 30 THEN 'jovem'
        WHEN EXTRACT(YEAR FROM AGE(c.data_nascimento)) < 60 THEN 'adulto'
        ELSE 'idoso'
      END AS faixa_etaria,
      COUNT(*) AS total_vendas
    FROM venda v
    JOIN produto p ON p.id = v.id_produto
    JOIN cliente c ON c.id = v.id_cliente
    GROUP BY p.categoria, faixa_etaria;
  `);
	}

	async listarVendasCategoria() {
		return this.database.query(`SELECT * FROM vendas_categoria_idade`);
	}
}
