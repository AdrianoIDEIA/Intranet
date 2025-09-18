import express from 'express';
import { getPool, sql } from '../db/sqlserver.js';

const router = express.Router();

// GET /api/consultas/paciente-por-nome/:nome
// Busca pacientes na tabela CadPac usando pacNome (LIKE) e retorna pacCodigo e pacNome.
router.get('/paciente-por-nome/:nome', async (req, res, next) => {
  const { nome } = req.params;
  if (!nome || String(nome).trim().length === 0) {
    return res.status(400).json({ message: 'Parâmetro nome é obrigatório.' });
  }

  try {
    const pool = await getPool();
    // Utiliza parâmetro nome com wildcard para busca por primeiro nome ou parte do nome
    const nameParam = `%${String(nome).trim()}%`;
    const result = await pool.request()
      .input('nome', sql.VarChar, nameParam)
      .query(`SELECT TOP 200 pacCodigo, pacNome FROM CadPac WHERE pacNome LIKE @nome ORDER BY pacNome`);

    return res.json(result.recordset || []);
  } catch (err) {
    // Encaminha o erro para o middleware de tratamento
    return next(err);
  }
});

// GET /api/consultas/paciente/:codigo
// Busca detalhes do paciente por código
router.get('/paciente/:codigo', async (req, res, next) => {
  const { codigo } = req.params;
  if (!codigo || isNaN(codigo)) {
    return res.status(400).json({ message: 'Parâmetro codigo é obrigatório e deve ser numérico.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('codigo', sql.Int, Number(codigo))
      .query(`SELECT pacCodigo, pacNome, pacSexo, pacDtNasc, pacPaiNome, pacMaeNome FROM CadPac WHERE pacCodigo = @codigo`);

    if (result.recordset && result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: 'Paciente não encontrado.' });
    }
  } catch (err) {
    return next(err);
  }
});

// Diagnostic: check DB connectivity
router.get('/health-db', async (_req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 AS ok');
    if (result && result.recordset && result.recordset[0] && result.recordset[0].ok === 1) {
      return res.json({ ok: true });
    }
    return res.status(500).json({ ok: false, message: 'Unexpected DB response' });
  } catch (err) {
    return next(err);
  }
});

export default router;
