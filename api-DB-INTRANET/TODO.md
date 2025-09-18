# Configuração da Nova API para Novo Banco

## Implementação Concluída
- Criada estrutura completa da API em `api-novobanco/`
- Arquivos criados e dependências instaladas

## Próximos Passos
1. Configurar `.env` com credenciais do novo banco
2. Testar conexão: `cd api-novobanco && node src/db_test.js`
3. Iniciar API: `npm run dev` (porta 5002)
4. Testar endpoints:
   - GET /health
   - GET /api/consultas/health-db
   - GET /api/consultas/paciente-por-nome/:nome
   - GET /api/consultas/paciente/:codigo

## Notas
- Porta 5002 para não conflitar com api-sqlserver (porta 5001)
- Mesmo token de API ou diferente, conforme necessário
- Endpoints idênticos aos da API original
