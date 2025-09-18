API SQL Server (consultas específicas)

Variáveis de ambiente (crie um arquivo .env na pasta api-sqlserver):

- SQLSERVER_HOST=localhost
- SQLSERVER_DB=MinhaBase
- SQLSERVER_USER=meu_usuario
- SQLSERVER_PASSWORD=minha_senha
- API_TOKEN=troque_este_token
- PORT=5001

Instalação:

- npm install

Execução (desenvolvimento):

- npm run dev

Rotas de exemplo:

- GET /health
- GET /api/consultas/pacientes-ativos
- GET /api/consultas/pendencias?especialidade=TO|Fono|Psico
- GET /api/consultas/paciente-por-cpf/:cpf

Cabeçalho obrigatório:

- x-api-token: <o mesmo valor de API_TOKEN do seu .env>

Ajuste as queries em src/routes/consultas.js conforme suas tabelas/colunas.


