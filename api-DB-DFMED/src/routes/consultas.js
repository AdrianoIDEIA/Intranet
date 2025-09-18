import express from 'express';
import { getPool } from '../db/sqlserver.js';
import {
  buscarPacientesPorNome,
  buscarPacientePorId
} from '../queries/patientQueries.js';
import {
  validateStringParam,
  validateNumberParam,
  validateParams
} from '../middleware/validation.js';

const router = express.Router();

// GET /api/consultas/paciente-por-nome/:nome
// Busca pacientes por nome com paginação
router.get('/paciente-por-nome/:nome',
  validateStringParam('nome'),
  async (req, res, next) => {
    try {
      const { nome } = req.params;
      const { page, limit } = req.query;

      console.log('Buscando pacientes por nome:', nome);

      const pool = await getPool();
      const result = await buscarPacientesPorNome(pool, nome, { page, limit });

      console.log(`Resultado: ${result.data.length} registros encontrados`);
      return res.json(result);
    } catch (err) {
      console.error('Erro na consulta paciente-por-nome:', err);
      return next(err);
    }
  }
);

// GET /api/consultas/paciente/:codigo
// Busca detalhes completos do paciente por ID
router.get('/paciente/:codigo',
  validateNumberParam('codigo', 1),
  async (req, res, next) => {
    try {
      const { codigo } = req.params;

      console.log('Buscando paciente por ID:', codigo);

      const pool = await getPool();
      const paciente = await buscarPacientePorId(pool, codigo);

      if (!paciente) {
        return res.status(404).json({ message: 'Paciente não encontrado.' });
      }

      return res.json(paciente);
    } catch (err) {
      console.error('Erro na consulta paciente:', err);
      return next(err);
    }
  }
);

// GET /api/consultas/pacientes-por-terapeuta/:terapeutaId
// Busca pacientes de um terapeuta específico
router.get('/pacientes-por-terapeuta/:terapeutaId',
  validateNumberParam('terapeutaId', 1),
  async (req, res, next) => {
    try {
      const { terapeutaId } = req.params;
      const { page, limit } = req.query;

      console.log('Buscando pacientes por terapeuta:', terapeutaId);

      const pool = await getPool();
      const result = await buscarPacientesPorTerapeuta(pool, terapeutaId, { page, limit });

      return res.json(result);
    } catch (err) {
      console.error('Erro na consulta pacientes-por-terapeuta:', err);
      return next(err);
    }
  }
);

// GET /api/consultas/pacientes-com-pendencias
// Busca pacientes que possuem pendências ativas
router.get('/pacientes-com-pendencias', async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    console.log('Buscando pacientes com pendências');

    const pool = await getPool();
    const result = await buscarPacientesComPendencias(pool, { page, limit });

    return res.json(result);
  } catch (err) {
    console.error('Erro na consulta pacientes-com-pendencias:', err);
    return next(err);
  }
});

// GET /api/consultas/estatisticas
// Retorna estatísticas gerais do sistema
router.get('/estatisticas', async (req, res, next) => {
  try {
    console.log('Buscando estatísticas do sistema');

    const pool = await getPool();
    const estatisticas = await buscarEstatisticasPacientes(pool);

    return res.json(estatisticas);
  } catch (err) {
    console.error('Erro na consulta estatisticas:', err);
    return next(err);
  }
});

// GET /api/consultas/health-db
// Verifica conectividade com o banco de dados
router.get('/health-db', async (_req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 AS ok');

    if (result && result.recordset && result.recordset[0] && result.recordset[0].ok === 1) {
      return res.json({ ok: true, message: 'Conectividade com banco de dados OK' });
    }

    return res.status(500).json({ ok: false, message: 'Resposta inesperada do banco de dados' });
  } catch (err) {
    console.error('Erro na verificação de conectividade:', err);
    return res.status(500).json({ ok: false, message: `Erro de conectividade: ${err.message}` });
  }
});

export default router;
