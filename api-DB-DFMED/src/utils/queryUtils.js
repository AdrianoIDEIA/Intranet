/**
 * Utilitários para operações de banco de dados
 */

/**
 * Sanitiza e valida parâmetro de string
 * @param {string} value - Valor a ser sanitizado
 * @param {number} maxLength - Comprimento máximo (opcional)
 * @returns {string|null} Valor sanitizado ou null se inválido
 */
export function sanitizeString(value, maxLength = 255) {
  if (!value || typeof value !== 'string') return null;

  const sanitized = value.trim();
  if (sanitized.length === 0 || sanitized.length > maxLength) return null;

  return sanitized;
}

/**
 * Valida e converte parâmetro numérico
 * @param {any} value - Valor a ser convertido
 * @param {number} min - Valor mínimo (opcional)
 * @param {number} max - Valor máximo (opcional)
 * @returns {number|null} Valor numérico válido ou null
 */
export function sanitizeNumber(value, min = null, max = null) {
  const num = Number(value);
  if (isNaN(num)) return null;

  if (min !== null && num < min) return null;
  if (max !== null && num > max) return null;

  return num;
}

/**
 * Cria parâmetros de paginação padronizados
 * @param {object} query - Query parameters do Express
 * @returns {object} Objeto com page, limit, offset
 */
export function getPaginationParams(query) {
  const page = sanitizeNumber(query.page, 1) || 1;
  const limit = sanitizeNumber(query.limit, 1, 1000) || 50; // máximo 1000 registros
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Cria parâmetros de ordenação padronizados
 * @param {string} sortBy - Campo para ordenar
 * @param {string} sortOrder - Ordem (asc/desc)
 * @param {string[]} allowedFields - Campos permitidos para ordenação
 * @returns {object} Objeto com sortBy e sortOrder validados
 */
export function getSortParams(sortBy, sortOrder, allowedFields = []) {
  const validOrders = ['asc', 'desc'];
  const order = validOrders.includes(sortOrder?.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

  let field = 'id'; // campo padrão
  if (sortBy && allowedFields.includes(sortBy)) {
    field = sortBy;
  }

  return { sortBy: field, sortOrder: order };
}

/**
 * Executa query com tratamento de erro padronizado
 * @param {object} pool - Pool de conexão do MSSQL
 * @param {string} query - Query SQL
 * @param {object} params - Parâmetros da query
 * @returns {Promise<object[]>} Resultado da query
 */
export async function executeQuery(pool, query, params = {}) {
  try {
    const request = pool.request();

    // Adiciona parâmetros dinamicamente
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    const result = await request.query(query);
    return result.recordset || [];
  } catch (error) {
    console.error('Erro na execução da query:', {
      query: query.substring(0, 100) + '...',
      params,
      error: error.message
    });
    throw new Error(`Erro na consulta ao banco de dados: ${error.message}`);
  }
}

/**
 * Cria resposta padronizada para listas paginadas
 * @param {object[]} data - Dados da consulta
 * @param {number} total - Total de registros
 * @param {number} page - Página atual
 * @param {number} limit - Limite por página
 * @returns {object} Resposta padronizada
 */
export function createPaginatedResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * Valida formato de data
 * @param {string} dateString - String de data
 * @returns {boolean} Verdadeiro se formato válido
 */
export function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Formata data para SQL Server
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada
 */
export function formatDateForSQL(date) {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}
