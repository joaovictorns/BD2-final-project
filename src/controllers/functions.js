import DatabaseFunctions from '@database/functions';

export default class FunctionsController {
	constructor() {
		this.dbFunctions = new DatabaseFunctions();
	}

	async reajusteSalarial(req, res) {
		try {
			const { percentual, categoria } = req.body;

			if (!percentual || !categoria) {
				return res.status(400).json({
					status: 'error',
					message: 'Percentual e categoria são obrigatórios'
				});
			}

			const connection = await this.dbFunctions._getConnection();
			await connection.query('CALL reajuste_salarial($1, $2)', [percentual, categoria]);

			return res.status(200).json({
				status: 'success',
				message: 'Reajuste salarial aplicado com sucesso'
			});
		} catch (error) {
			return res.status(500).json({
				status: 'error',
				message: 'Erro ao aplicar reajuste salarial'
			});
		}
	}

	async realizarSorteio(req, res) {
		try {
			const connection = await this.dbFunctions._getConnection();
			const result = await connection.query('CALL sorteio_cliente($1, $2)', [
				{ type: 'OUT', value: null },
				{ type: 'OUT', value: null }
			]);

			const [clienteId, valorVoucher] = result[0];

			const cliente = await connection.query(
				'SELECT nome, sexo, idade FROM cliente WHERE id = $1',
				[clienteId]
			);

			return res.status(200).json({
				status: 'success',
				data: {
					cliente: cliente[0],
					valor_voucher: valorVoucher
				}
			});
		} catch (error) {
			return res.status(500).json({
				status: 'error',
				message: 'Erro ao realizar sorteio'
			});
		}
	}

	async realizarVenda(req, res) {
		try {
			const { id_vendedor, id_cliente, id_produto, id_transportadora, endereco_destino, valor_cobrado } = req.body;

			if (!id_vendedor || !id_cliente || !id_produto) {
				return res.status(400).json({
					status: 'error',
					message: 'id_vendedor, id_cliente e id_produto são obrigatórios'
				});
			}

			const connection = await this.dbFunctions._getConnection();
			await connection.query('CALL realizar_venda($1, $2, $3, $4, $5, $6)', [
				id_vendedor,
				id_cliente,
				id_produto,
				id_transportadora,
				endereco_destino,
				valor_cobrado
			]);

			return res.status(200).json({
				status: 'success',
				message: 'Venda realizada com sucesso'
			});
		} catch (error) {
			return res.status(500).json({
				status: 'error',
				message: 'Erro ao realizar venda'
			});
		}
	}

	async getEstatisticas(req, res) {
		try {
			const connection = await this.dbFunctions._getConnection();
			const result = await connection.query('CALL estatisticas_vendas($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
				{ type: 'OUT', value: null },
				{ type: 'OUT', value: null },
				{ type: 'OUT', value: null },
				{ type: 'OUT', value: null },
				{ type: 'OUT', value: null },
				{ type: 'OUT', value: null },
				{ type: 'OUT', value: null },
				{ type: 'OUT', value: null },
				{ type: 'OUT', value: null }
			]);

			const [
				produto_mais_vendido,
				vendedor_mais_vendas,
				produto_menos_vendido,
				valor_mais_vendido,
				mes_maior_mais,
				mes_menor_mais,
				valor_menos_vendido,
				mes_maior_menos,
				mes_menor_menos
			] = result[0];

			return res.status(200).json({
				status: 'success',
				data: {
					produto_mais_vendido,
					vendedor_mais_vendas,
					valor_mais_vendido,
					mes_maior_mais,
					mes_menor_mais,
					produto_menos_vendido,
					valor_menos_vendido,
					mes_maior_menos,
					mes_menor_menos
				}
			});
		} catch (error) {
			return res.status(500).json({
				status: 'error',
				message: 'Erro ao buscar estatísticas'
			});
		}
	}
}
