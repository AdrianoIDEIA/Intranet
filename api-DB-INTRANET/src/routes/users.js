import express from 'express';
import {
  buscarUsuarioPorEmail,
  buscarUsuarioPorId,
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  desativarUsuario,
  buscarUsuariosDFmed
} from '../queries/userQueries.js';

const router = express.Router();

// GET /api/users - lista usuários ativos
router.get('/', async (_req, res, next) => {
  try {
    const usuarios = await listarUsuarios();
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/dfmed - lista usuários do DFmed para adicionar
router.get('/dfmed', async (_req, res, next) => {
  try {
    const usuarios = await buscarUsuariosDFmed();
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id - busca usuário por ID
router.get('/:id', async (req, res, next) => {
  try {
    const usuario = await buscarUsuarioPorId(parseInt(req.params.id));
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

// POST /api/users - cria novo usuário
router.post('/', async (req, res, next) => {
  try {
    const novoUsuario = await criarUsuario(req.body);
    res.status(201).json(novoUsuario);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id - atualiza usuário
router.put('/:id', async (req, res, next) => {
  try {
    const usuarioAtualizado = await atualizarUsuario(parseInt(req.params.id), req.body);
    res.json(usuarioAtualizado);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id - desativa usuário
router.delete('/:id', async (req, res, next) => {
  try {
    await desativarUsuario(parseInt(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
