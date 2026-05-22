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
				port: process.env.DB_PORT || 5432,
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
}
