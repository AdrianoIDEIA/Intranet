# API NovoBanco

API para conectar ao novo banco de dados SQL Server.

## Configuração

1. Instale as dependências:
   ```
   npm install
   ```

2. Configure o arquivo `.env` com as credenciais do novo banco:
   ```
   PORT=5002
   HOST=0.0.0.0
   API_TOKEN=seu_token_aqui
   SQLSERVER_HOST=host_do_novo_banco
   SQLSERVER_DB=nome_do_novo_banco
   SQLSERVER_USER=usuario
   SQLSERVER_PASSWORD=senha
   SQLSERVER_PORT=1433
   ```

3. Execute o teste de conexão:
   ```
   node src/db_test.js
   ```

4. Inicie o servidor:
   ```
   npm run dev
   ```

## Endpoints

- `GET /health` - Verifica se a API está rodando
- `GET /api/consultas/health-db` - Verifica conectividade com o banco
- `GET /api/consultas/paciente-por-nome/:nome` - Busca pacientes por nome
- `GET /api/consultas/paciente/:codigo` - Busca detalhes de um paciente por código
