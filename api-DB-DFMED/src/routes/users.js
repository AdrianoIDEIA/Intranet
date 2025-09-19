import express from 'express';
import { getPool } from '../db/sqlserver.js';
import {
  buscarUsuariosPorNome,
  buscarUsuarioPorCodigo,
  buscarTodosUsuarios
} from '../queries/userQueries.js';
import {
  validateStringParam,
  validateNumberParam,
  validateParams
} from '../middleware/validation.js';

const router = express.Router();

// GET /api/users/usuario-por-nome/:nome
// Busca usuários por nome
router.get('/usuario-por-nome/:nome',
  validateStringParam('nome'),
  async (req, res, next) => {
    try {
      const { nome } = req.params;
      const { page, limit } = req.query;

      console.log('Buscando usuários por nome:', nome);

      const pool = await getPool();
      const result = await buscarUsuariosPorNome(pool, nome, { page, limit });

      console.log(`Resultado: ${result.data.length} registros encontrados`);
      return res.json(result);
    } catch (err) {
      console.error('Erro na consulta usuario-por-nome:', err);
      return next(err);
    }
  }
);

// GET /api/users/usuario/:codigo
// Busca detalhes do usuário por código
router.get('/usuario/:codigo',
  validateNumberParam('codigo', 1),
  async (req, res, next) => {
    try {
      const { codigo } = req.params;

      console.log('Buscando usuário por código:', codigo);

      const pool = await getPool();
      const usuario = await buscarUsuarioPorCodigo(pool, codigo);

      if (!usuario) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      return res.json(usuario);
    } catch (err) {
      console.error('Erro na consulta usuario:', err);
      return next(err);
    }
  }
);

// GET /api/users
// Busca todos os usuários ativos
router.get('/', async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    console.log('Buscando todos os usuários');

    const pool = await getPool();
    const result = await buscarTodosUsuarios(pool, { page, limit });

    return res.json(result);
  } catch (err) {
    console.error('Erro na consulta usuarios:', err);
    return next(err);
  }
});

export default router;
