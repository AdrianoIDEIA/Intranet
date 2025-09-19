import express from 'express';
import {
  buscarUsuarioPorUsrCodigo,
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  desativarUsuario,
  buscarUsuariosDFmed,
  autenticarUsuario,
  alterarSenhaUsuario
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

// GET /api/users/:usrCodigo - busca usuário por usrCodigo
router.get('/:usrCodigo', async (req, res, next) => {
  try {
    const usuario = await buscarUsuarioPorUsrCodigo(parseInt(req.params.usrCodigo));
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

// POST /api/users - cria novo usuário (permitido para role ADMIN)
router.post('/', async (req, res, next) => {
  try {
    // Verifica se o usuário autenticado tem role ADMIN
    const usuarioAutenticado = req.user; // Assumindo que middleware de autenticação popula req.user
    if (!usuarioAutenticado || usuarioAutenticado.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem adicionar usuários.' });
    }

    const novoUsuario = await criarUsuario(req.body);
    res.status(201).json(novoUsuario);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:usrCodigo - atualiza usuário
router.put('/:usrCodigo', async (req, res, next) => {
  try {
    const usuarioAtualizado = await atualizarUsuario(parseInt(req.params.usrCodigo), req.body);
    res.json(usuarioAtualizado);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:usrCodigo - desativa usuário
router.delete('/:usrCodigo', async (req, res, next) => {
  try {
    await desativarUsuario(parseInt(req.params.usrCodigo));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/users/login - autentica usuário
router.post('/login', async (req, res, next) => {
  try {
    const { nome, senha } = req.body;
    if (!nome || !senha) {
      return res.status(400).json({ message: 'Nome e senha são obrigatórios' });
    }

    const usuario = await autenticarUsuario(nome, senha);
    if (!usuario) {
      return res.status(401).json({ message: 'Nome ou senha inválidos' });
    }

    res.json({ user: usuario });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/change-password - altera senha do usuário
router.post('/change-password', async (req, res, next) => {
  try {
    const { usrCodigo, senhaAtual, novaSenha } = req.body;
    if (!usrCodigo || !senhaAtual || !novaSenha) {
      return res.status(400).json({ message: 'usrCodigo, senhaAtual e novaSenha são obrigatórios' });
    }

    await alterarSenhaUsuario(usrCodigo, senhaAtual, novaSenha);
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    next(err);
  }
});

export default router;
