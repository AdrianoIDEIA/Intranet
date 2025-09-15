import { Router } from 'express';
import { getPool, sql } from '../db/sqlserver.js';

const router = Router();

// Exemplo 1: pacientes ativos (ajuste tabela e colunas)
router.get('/pacientes-ativos', async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('status', sql.VarChar, 'ATIVO')
      .query(`
        SELECT TOP 100 IdPaciente, Nome, DataNascimento
        FROM Pacientes
        WHERE Status = @status
        ORDER BY DataAtualizacao DESC
      `);
    res.json(result.recordset);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erro na consulta pacientes-ativos' });
  }
});

// Exemplo 2: pendências por especialidade (TO/Fono/Psico)
router.get('/pendencias', async (req, res) => {
  try {
    const especialidade = (req.query.especialidade || '').toString();
    if (!especialidade) return res.status(400).json({ message: 'especialidade obrigatória' });

    const pool = await getPool();
    const result = await pool.request()
      .input('esp', sql.VarChar, especialidade)
      .query(`
        SELECT TOP 100 IdAnamnese, Paciente, Especialidade, Status, AtualizadoEm
        FROM Pendencias
        WHERE Especialidade = @esp AND Status = 'PENDENTE'
        ORDER BY AtualizadoEm DESC
      `);
    res.json(result.recordset);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erro na consulta de pendências' });
  }
});

// Exemplo 3: busca por CPF
router.get('/paciente-por-cpf/:cpf', async (req, res) => {
  try {
    const cpf = (req.params.cpf || '').toString();
    const pool = await getPool();
    const result = await pool.request()
      .input('cpf', sql.VarChar, cpf)
      .query(`
        SELECT TOP 1 IdPaciente, Nome, CPF, DataNascimento
        FROM Pacientes
        WHERE CPF = @cpf
      `);
    res.json(result.recordset[0] || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erro na consulta por CPF' });
  }
});

export default router;


