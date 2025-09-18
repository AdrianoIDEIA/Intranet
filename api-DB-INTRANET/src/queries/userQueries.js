import { getPool, sql } from '../db/sqlserver.js';

/**
 * Queries relacionadas a usuários
 */

/**
 * Busca usuário por email
 */
export async function buscarUsuarioPorEmail(email) {
  const pool = await getPool();
  const result = await pool.request()
    .input('email', sql.VarChar, email)
    .query('SELECT * FROM Usuarios WHERE email = @email AND ativo = 1');

  return result.recordset[0] || null;
}

/**
 * Busca usuário por ID
 */
export async function buscarUsuarioPorId(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT usuario_id, nome, email, role, ativo, data_criacao FROM Usuarios WHERE usuario_id = @id AND ativo = 1');

  return result.recordset[0] || null;
}

/**
 * Lista todos os usuários
 */
export async function listarUsuarios() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT usuario_id, nome, email, role, ativo, data_criacao FROM Usuarios WHERE ativo = 1 ORDER BY nome');

  return result.recordset;
}

/**
 * Cria novo usuário
 */
export async function criarUsuario(dados) {
  const { nome, email, senha, role = 'USER' } = dados;
  const pool = await getPool();

  const result = await pool.request()
    .input('nome', sql.VarChar, nome)
    .input('email', sql.VarChar, email)
    .input('senha', sql.VarChar, senha)
    .input('role', sql.VarChar, role)
    .query(`
      INSERT INTO Usuarios (nome, email, senha, role)
      OUTPUT INSERTED.*
      VALUES (@nome, @email, @senha, @role)
    `);

  return result.recordset[0];
}

/**
 * Atualiza usuário
 */
export async function atualizarUsuario(id, dados) {
  const { nome, email, role, ativo } = dados;
  const pool = await getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('nome', sql.VarChar, nome)
    .input('email', sql.VarChar, email)
    .input('role', sql.VarChar, role)
    .input('ativo', sql.Bit, ativo)
    .query(`
      UPDATE Usuarios
      SET nome = @nome, email = @email, role = @role, ativo = @ativo, data_atualizacao = GETDATE()
      OUTPUT INSERTED.*
      WHERE usuario_id = @id
    `);

  return result.recordset[0];
}

/**
 * Desativa usuário (soft delete)
 */
export async function desativarUsuario(id) {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, id)
    .query('UPDATE Usuarios SET ativo = 0, data_atualizacao = GETDATE() WHERE usuario_id = @id');

  return true;
}

/**
 * Busca usuários do DFmed para adicionar
 */
export async function buscarUsuariosDFmed() {
  const pool = await getPool();
  const result = await pool.request()
    .query(`
      SELECT TOP 100
        pacCodigo as id,
        pacNome as nome,
        'USER' as role_sugerida
      FROM CadPac
      WHERE pacNome IS NOT NULL AND LEN(pacNome) > 0
      ORDER BY pacNome
    `);

  return result.recordset;
}
