import { executeQuery, sanitizeString, sanitizeNumber, getPaginationParams, createPaginatedResponse } from '../utils/queryUtils.js';

/**
 * Queries relacionadas a pacientes
 * Centraliza todas as operações de banco para pacientes
 */

/**
 * Busca pacientes por nome com paginação
 * @param {object} pool - Pool de conexão
 * @param {string} nome - Nome ou parte do nome
 * @param {object} options - Opções de paginação e filtros
 * @returns {Promise<object>} Resultado paginado
 */
export async function buscarPacientesPorNome(pool, nome, options = {}) {
  const nomeSanitizado = sanitizeString(nome);
  if (!nomeSanitizado) {
    throw new Error('Nome é obrigatório e deve ser uma string válida');
  }

  const { page, limit, offset } = getPaginationParams(options);

  // Query para contar total
  const countQuery = `
    SELECT COUNT(*) as total
    FROM CadPac
    WHERE pacNome LIKE @nome
  `;

  // Query principal com paginação
  const dataQuery = `
    SELECT TOP (@limit) pacCodigo, pacNome, pacDtNasc, pacSexo
    FROM CadPac
    WHERE pacNome LIKE @nome
    ORDER BY pacNome
  `;

  try {
    const nomeParam = `%${nomeSanitizado}%`;

    // Executa query de contagem
    const countResult = await executeQuery(pool, countQuery, { nome: nomeParam });
    const total = countResult[0]?.total || 0;

    // Executa query principal se houver resultados
    let data = [];
    if (total > 0) {
      data = await executeQuery(pool, dataQuery, {
        nome: nomeParam,
        limit
      });
    }

    return createPaginatedResponse(data, total, page, limit);
  } catch (error) {
    console.error('Erro ao buscar pacientes por nome:', error);
    throw error;
  }
}

/**
 * Busca detalhes completos de um paciente por ID
 * @param {object} pool - Pool de conexão
 * @param {number} pacienteId - ID do paciente
 * @returns {Promise<object|null>} Dados do paciente ou null se não encontrado
 */
export async function buscarPacientePorId(pool, pacienteId) {
  const idSanitizado = sanitizeNumber(pacienteId, 1);
  if (!idSanitizado) {
    throw new Error('ID do paciente é obrigatório e deve ser um número válido');
  }

  const query = `
    SELECT
      pacCodigo,
      pacNome,
      pacDtNasc,
      pacSexo,
      pacPaiNome,
      pacMaeNome
    FROM CadPac
    WHERE pacCodigo = @pacCodigo
  `;

  try {
    const result = await executeQuery(pool, query, { pacCodigo: idSanitizado });

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Erro ao buscar paciente por ID:', error);
    throw error;
  }
}

/**
 * Busca pacientes por terapeuta
 * @param {object} pool - Pool de conexão
 * @param {number} terapeutaId - ID do terapeuta
 * @param {object} options - Opções de paginação
 * @returns {Promise<object>} Resultado paginado
 */
export async function buscarPacientesPorTerapeuta(pool, terapeutaId, options = {}) {
  const idSanitizado = sanitizeNumber(terapeutaId, 1);
  if (!idSanitizado) {
    throw new Error('ID do terapeuta é obrigatório e deve ser um número válido');
  }

  const { page, limit, offset } = getPaginationParams(options);

  const countQuery = `
    SELECT COUNT(*) as total
    FROM Pacientes p
    INNER JOIN Paciente_Terapeuta pt ON p.paciente_id = pt.paciente_id
    WHERE pt.terapeuta_id = @terapeuta_id AND pt.data_fim IS NULL
  `;

  const dataQuery = `
    SELECT
      p.paciente_id,
      p.nome,
      p.data_nascimento,
      p.genero,
      pt.data_inicio as data_inicio_terapia
    FROM Pacientes p
    INNER JOIN Paciente_Terapeuta pt ON p.paciente_id = pt.paciente_id
    WHERE pt.terapeuta_id = @terapeuta_id AND pt.data_fim IS NULL
    ORDER BY p.nome
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  try {
    const countResult = await executeQuery(pool, countQuery, { terapeuta_id: idSanitizado });
    const total = countResult[0]?.total || 0;

    let data = [];
    if (total > 0) {
      data = await executeQuery(pool, dataQuery, {
        terapeuta_id: idSanitizado,
        offset,
        limit
      });
    }

    return createPaginatedResponse(data, total, page, limit);
  } catch (error) {
    console.error('Erro ao buscar pacientes por terapeuta:', error);
    throw error;
  }
}

/**
 * Busca pacientes com pendências ativas
 * @param {object} pool - Pool de conexão
 * @param {object} options - Opções de paginação e filtros
 * @returns {Promise<object>} Resultado paginado
 */
export async function buscarPacientesComPendencias(pool, options = {}) {
  const { page, limit, offset } = getPaginationParams(options);

  const countQuery = `
    SELECT COUNT(DISTINCT p.paciente_id) as total
    FROM Pacientes p
    INNER JOIN Pendencias pen ON p.paciente_id = pen.paciente_id
    INNER JOIN Status s ON pen.status_id = s.status_id
    WHERE s.nome_status NOT IN ('Concluída', 'Cancelada')
  `;

  const dataQuery = `
    SELECT DISTINCT
      p.paciente_id,
      p.nome,
      p.data_nascimento,
      COUNT(pen.pendencia_id) as total_pendencias,
      STRING_AGG(s.nome_status, ', ') as status_pendencias
    FROM Pacientes p
    INNER JOIN Pendencias pen ON p.paciente_id = pen.paciente_id
    INNER JOIN Status s ON pen.status_id = s.status_id
    WHERE s.nome_status NOT IN ('Concluída', 'Cancelada')
    GROUP BY p.paciente_id, p.nome, p.data_nascimento
    ORDER BY total_pendencias DESC, p.nome
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  try {
    const countResult = await executeQuery(pool, countQuery);
    const total = countResult[0]?.total || 0;

    let data = [];
    if (total > 0) {
      data = await executeQuery(pool, dataQuery, { offset, limit });
    }

    return createPaginatedResponse(data, total, page, limit);
  } catch (error) {
    console.error('Erro ao buscar pacientes com pendências:', error);
    throw error;
  }
}

/**
 * Busca estatísticas gerais de pacientes
 * @param {object} pool - Pool de conexão
 * @returns {Promise<object>} Estatísticas
 */
export async function buscarEstatisticasPacientes(pool) {
  const queries = {
    total_pacientes: 'SELECT COUNT(*) as count FROM Pacientes',
    pacientes_ativos: `
      SELECT COUNT(DISTINCT p.paciente_id) as count
      FROM Pacientes p
      INNER JOIN Paciente_Terapeuta pt ON p.paciente_id = pt.paciente_id
      WHERE pt.data_fim IS NULL
    `,
    pacientes_com_pendencias: `
      SELECT COUNT(DISTINCT p.paciente_id) as count
      FROM Pacientes p
      INNER JOIN Pendencias pen ON p.paciente_id = pen.paciente_id
      INNER JOIN Status s ON pen.status_id = s.status_id
      WHERE s.nome_status NOT IN ('Concluída', 'Cancelada')
    `,
    terapeutas_ativos: 'SELECT COUNT(*) as count FROM Terapeutas'
  };

  try {
    const results = await Promise.all(
      Object.entries(queries).map(async ([key, query]) => {
        const result = await executeQuery(pool, query);
        return { [key]: result[0]?.count || 0 };
      })
    );

    return Object.assign({}, ...results);
  } catch (error) {
    console.error('Erro ao buscar estatísticas de pacientes:', error);
    throw error;
  }
}
