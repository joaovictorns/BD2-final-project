# CRUD-BD

A Node.js project with Express and PostgreSQL.

## Setup

1. Instale as dependências na raiz do repositório:
```bash
yarn install
```

2. Create a `.env` file in the root directory with the following variables:
```

**Opção — Homebrew (instalação local)**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb crud-bd
```

4. Inicie o servidor:
```bash
yarn start:dev
```

5. Crie as tabelas e dados iniciais (com o servidor rodando):
```bash
curl -X POST http://localhost:4444/setup/init-database
```

## Erro `ECONNREFUSED` na porta 5432?

Significa que o PostgreSQL **não está rodando**. Confira:
- Docker: `docker compose ps` deve mostrar o container `crud-bd-postgres` como `running`
- Homebrew: `brew services list` deve mostrar `postgresql@16` como `started`

## Erro `role "postgres" does not exist`?

No PostgreSQL instalado pelo **Homebrew no Mac**, o usuário padrão é o seu login do sistema (ex.: `Joao`), não `postgres`.

No `.env`, use:
```
DB_USER=Joao
DB_PASSWORD=
```

Se usar **Docker** (`docker compose up`), aí sim use `DB_USER=postgres` e a senha definida no `docker-compose.yml`.

## Project Structure

```
src/
  ├── routes/      # Route definitions
  ├── controllers/ # Route controllers
  ├── services/    # Business logic
  └── server.js    # Application entry point
```

## Available Endpoints

- `GET /health` - Health check endpoint
