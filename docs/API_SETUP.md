Frontend (Vite) + Backend (api-sqlserver) setup

1) API (.env) - api-sqlserver/.env

PORT=5001
HOST=0.0.0.0
API_TOKEN=troque_este_token
SQLSERVER_HOST=your_sql_host
SQLSERVER_DB=your_db
SQLSERVER_USER=your_user
SQLSERVER_PASSWORD=your_password

2) Frontend (.env) - project root (Intranet/.env)

VITE_API_URL=http://localhost:5001
VITE_API_TOKEN=troque_este_token

3) Run

# API
cd api-sqlserver
npm install
npm run dev

# Frontend
cd ..
npm install
npm run dev

4) Test endpoints
# from frontend, use search box on "Painel de Pacientes"
# direct test (PowerShell):
Invoke-RestMethod -Uri 'http://localhost:5001/api/consultas/paciente-por-nome/Adriano' -Headers @{ 'x-api-token' = 'troque_este_token' } -Method Get

5) Notes
- Ensure `VITE_API_URL` matches the host where API is reachable from the browser.
- If the app is served from a different host, set `HOST` and `VITE_API_URL` accordingly.
- Use the `health-db` endpoint to verify DB connectivity: `/api/consultas/health-db`