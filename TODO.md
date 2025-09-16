# Implementação do Endpoint para Detalhes do Paciente

## Problema Identificado
- O SQL Server está funcionando, mas falta implementar o endpoint para buscar detalhes do paciente na anamnese.
- Necessário endpoint GET /api/consultas/paciente/:codigo que retorna pacNome, pacSexo, pacDtNasc, pacPaiNome, pacMaeNome.

## Plano de Implementação

### 1. Adicionar Endpoint no consultas.js
- Arquivo: `api-sqlserver/src/routes/consultas.js`
- Novo endpoint: GET /api/consultas/paciente/:codigo
- Query SQL: SELECT pacNome, pacSexo, pacDtNasc, pacPaiNome, pacMaeNome FROM CadPac WHERE pacCodigo = @codigo
- Retornar JSON com os campos do paciente

### 2. Testar Endpoint
- Iniciar API: `cd api-sqlserver && npm run dev`
- Testar com curl ou navegador: `http://localhost:5001/api/consultas/paciente/123` (substituir 123 por código real)
- Headers: x-api-token

### 3. Verificar Frontend
- Arquivo: `index.tsx`
- Função fetchPatientDetails deve chamar o novo endpoint
- Exibir os detalhes na interface

## Dependências
- consultas.js (adicionar endpoint)
- index.tsx (já implementado fetchPatientDetails)

## Follow-up
- Implementar o endpoint
- Testar a funcionalidade completa no frontend
