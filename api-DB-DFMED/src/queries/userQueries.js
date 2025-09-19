import { executeQuery } from '../utils/queryUtils.js';

/**
 * Busca usuários por nome na tabela Usuarios
 * @param {Object} pool - Pool de conexão do SQL Server
 * @param {string} nome - Nome a ser buscado
 * @param {Object} options - Opções de paginação
 * @returns {Promise<Object>} Resultado da consulta
 */
export async function buscarUsuariosPorNome(pool, nome, options = {}) {
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;

  const query = `
    SELECT
      usrCodigo,
      usrNome,
      usrDtNasc,
      usrFlagMedico,
      usrNomeCompleto,
      usrCRM,
      usrCpfCgc,
      usrFlagAtivo,
      usrFlagDeletado,
      usrAssinatura,
      usrFlagTemMensagem
    FROM [dfMed].[dbo].[Usuarios]
    WHERE usrNome LIKE '%' + @nome + '%'
      AND usrFlagAtivo = 1
      AND usrFlagDeletado = 0
    ORDER BY usrNome
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  const params = {
    nome: nome,
    limit: limit,
    offset: offset
  };

  const result = await executeQuery(pool, query, params);

  return {
    data: result,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: result.length
    }
  };
}

/**
 * Busca usuário por código na tabela Usuarios
 * @param {Object} pool - Pool de conexão do SQL Server
 * @param {number} codigo - Código do usuário
 * @returns {Promise<Object|null>} Dados do usuário ou null se não encontrado
 */
export async function buscarUsuarioPorCodigo(pool, codigo) {
  const query = `
    SELECT
      usrCodigo,
      usrNome,
      usrDtNasc,
      usrFlagMedico,
      usrNomeCompleto,
      usrCRM,
      usrCpfCgc,
      usrFlagAtivo,
      usrFlagDeletado,
      usrAssinatura,
      usrFlagTemMensagem
    FROM [dfMed].[dbo].[Usuarios]
    WHERE usrCodigo = @codigo
      AND usrFlagAtivo = 1
      AND usrFlagDeletado = 0
  `;

  const params = { codigo: codigo };

  const result = await executeQuery(pool, query, params);
  return result.length > 0 ? result[0] : null;
}

/**
 * Busca todos os usuários ativos (para listagem)
 * @param {Object} pool - Pool de conexão do SQL Server
 * @param {Object} options - Opções de paginação
 * @returns {Promise<Object>} Resultado da consulta
 */
export async function buscarTodosUsuarios(pool, options = {}) {
  const { page = 1, limit = 50 } = options;
  const offset = (page - 1) * limit;

  const query = `
    SELECT
      usrCodigo,
      usrNome,
      usrDtNasc,
      usrFlagMedico,
      usrNomeCompleto,
      usrCRM,
      usrCpfCgc,
      usrFlagAtivo,
      usrFlagDeletado,
      usrAssinatura,
      usrFlagTemMensagem
    FROM [dfMed].[dbo].[Usuarios]
    WHERE usrFlagAtivo = 1
      AND usrFlagDeletado = 0
    ORDER BY usrNome
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  const params = {
    limit: limit,
    offset: offset
  };

  const result = await executeQuery(pool, query, params);

  return {
    data: result,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: result.length
    }
  };
}
