import Database from '@database';


export default class UserOrchestratorService {
  constructor() {
    this.database = new Database();
  }

  async createAllUsers() {
    const admin = await this.database.createAdministrador();

    const gerente = await this.database.createGerente();

    const funcionario = await this.database.createFuncionario();

    return {
      admin,
      gerente,
      funcionario,
    };
  }
}
