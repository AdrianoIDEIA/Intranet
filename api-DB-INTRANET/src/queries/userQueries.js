import { getPool, sql } from '../db/sqlserver.js';
import { getDfmedPool } from '../db/dfmedSqlServer.js';
import bcrypt from 'bcrypt';

/**
 * Queries relacionadas a usuários
 */


/**
 * Autentica usuário por nome e senha
 */
export async function autenticarUsuario(nome, senha) {
  // migrarSenhasParaHash(); // Chama a função de migração (pode ser removida depois)
  const pool = await getPool();
  // Primeiro, busca o usuário pelo nome
  const userResult = await pool.request()
    .input('nome', sql.VarChar, nome)
    .query('SELECT usrCodigo, nome, senha, role, ativo FROM Usuarios WHERE nome = @nome AND ativo = 1');

  const usuario = userResult.recordset[0];

  if (!usuario) {
    return null; // Usuário não encontrado
  }

  // Compara a senha fornecida com o hash armazenado
  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (senhaValida) {
    delete usuario.senha; // Remove o hash da senha do objeto retornado
    return usuario;
  }

  return null; // Senha inválida
}

/**
 * Busca usuário por usrCodigo
 */
export async function buscarUsuarioPorUsrCodigo(usrCodigo) {
  const pool = await getPool();
  const result = await pool.request()
    .input('usrCodigo', sql.Int, usrCodigo)
    .query('SELECT usrCodigo, nome, role, ativo, data_criacao FROM Usuarios WHERE usrCodigo = @usrCodigo AND ativo = 1');

  return result.recordset[0] || null;
}

/**
 * Lista todos os usuários
 */
export async function listarUsuarios() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT usrCodigo, nome, role, ativo, data_criacao FROM Usuarios WHERE ativo = 1 ORDER BY nome');

  return result.recordset;
}

/**
 * Busca usuário no DFmed por usrCodigo
 */
export async function buscarUsuarioDFmedPorUsrCodigo(usrCodigo) {
  const pool = await getDfmedPool();
  const result = await pool.request()
    .input('usrCodigo', sql.Int, usrCodigo)
    .query('SELECT usrCodigo FROM [dfMed].[dbo].[Usuarios] WHERE usrCodigo = @usrCodigo AND usrFlagAtivo = 1 AND usrFlagDeletado = 0');

  return result.recordset[0] || null;
}

/**
 * Cria novo usuário buscando nome e usrCodigo do DFmed
 */
export async function criarUsuario(dados) {
  const { role = 'USER', usrCodigo } = dados;

  if (!usrCodigo) {
    throw new Error('usrCodigo é obrigatório para criar usuário.');
  }

  // Verifica se o usrCodigo já existe na base de dados intranet
  const usuarioIntranet = await buscarUsuarioPorUsrCodigo(usrCodigo);
  if (usuarioIntranet) {
    throw new Error('Usuário com este usrCodigo já existe na intranet.');
  }

  // Busca usuário no DFmed para obter nome e usrCodigo
  const poolDfmed = await getDfmedPool();
  const resultDfmed = await poolDfmed.request()
    .input('usrCodigo', sql.Int, usrCodigo)
    .query('SELECT usrNome as nome, usrCodigo FROM [dfMed].[dbo].[Usuarios] WHERE usrCodigo = @usrCodigo AND usrFlagAtivo = 1 AND usrFlagDeletado = 0');

  const usuarioDFmed = resultDfmed.recordset[0];
  if (!usuarioDFmed) {
    throw new Error('Usuário com este usrCodigo não encontrado no DFMED.');
  }

  // Gera uma senha fixa "12345" para ser alterada depois
  const senhaTemporaria = '12345';
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(senhaTemporaria, saltRounds);

  const pool = await getPool();

  const result = await pool.request()
    .input('nome', sql.VarChar, usuarioDFmed.nome)
    .input('senha', sql.VarChar, hashedPassword)
    .input('role', sql.VarChar, role)
    .input('usrCodigo', sql.Int, usuarioDFmed.usrCodigo)
    .query(`
      INSERT INTO Usuarios (nome, senha, role, usrCodigo)
      OUTPUT INSERTED.*
      VALUES (@nome, @senha, @role, @usrCodigo)
    `);

  const novoUsuario = result.recordset[0];
  novoUsuario.senhaTemporaria = senhaTemporaria; // Adiciona a senha em texto plano ao retorno
  delete novoUsuario.senha; // Remove o hash do retorno

  return novoUsuario;
}

/**
 * Atualiza usuário
 */
export async function atualizarUsuario(usrCodigo, dados) {
  const { nome, role, ativo, senha } = dados;
  const pool = await getPool();

  let setClauses = ['nome = @nome', 'role = @role', 'ativo = @ativo', 'data_atualizacao = GETDATE()'];
  const request = pool.request()
    .input('usrCodigo', sql.Int, usrCodigo)
    .input('nome', sql.VarChar, nome)
    .input('role', sql.VarChar, role)
    .input('ativo', sql.Bit, ativo);

  // Se uma nova senha foi fornecida, faz o hash e a inclui na atualização
  if (senha) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);
    setClauses.push('senha = @senha');
    request.input('senha', sql.VarChar, hashedPassword);
  }

  // Reorganiza a query com base nas cláusulas geradas
  const query = `
    UPDATE Usuarios
    SET ${setClauses.join(', ')}
    OUTPUT INSERTED.*
    WHERE usrCodigo = @usrCodigo
  `;

  // Executa a query
  const result = await request.query(query);

  // Exclui a senha do retorno para maior segurança
  if (result.recordset && result.recordset[0]) {
    delete result.recordset[0].senha;
  }
  return result.recordset[0];
}

/**
 * Desativa usuário (soft delete)
 */
export async function desativarUsuario(usrCodigo) {
  const pool = await getPool();
  await pool.request()
    .input('usrCodigo', sql.Int, usrCodigo)
    .query('UPDATE Usuarios SET ativo = 0, data_atualizacao = GETDATE() WHERE usrCodigo = @usrCodigo');

  return true;
}

/**
 * Busca usuários do DFmed para adicionar
 */
export async function buscarUsuariosDFmed() {
  const pool = await getDfmedPool();
  const result = await pool.request()
    .query(`
      SELECT TOP 100
        usrCodigo as id,
        usrNome as nome,
        'USER' as role_sugerida
      FROM [dfMed].[dbo].[Usuarios]
      WHERE usrNome IS NOT NULL AND LEN(usrNome) > 0 AND usrFlagAtivo = 1 AND usrFlagDeletado = 0
      ORDER BY usrNome
    `);

  return result.recordset;
}

/**
 * Altera senha do usuário
 */
export async function alterarSenhaUsuario(usrCodigo, senhaAtual, novaSenha) {
  const pool = await getPool();

  // Busca o usuário para verificar a senha atual
  const userResult = await pool.request()
    .input('usrCodigo', sql.Int, usrCodigo)
    .query('SELECT senha FROM Usuarios WHERE usrCodigo = @usrCodigo AND ativo = 1');

  const usuario = userResult.recordset[0];
  if (!usuario) {
    throw new Error('Usuário não encontrado.');
  }

  // Verifica se a senha atual está correta
  const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
  if (!senhaValida) {
    throw new Error('Senha atual incorreta.');
  }

  // Gera hash da nova senha
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(novaSenha, saltRounds);

  // Atualiza a senha
  await pool.request()
    .input('usrCodigo', sql.Int, usrCodigo)
    .input('senha', sql.VarChar, hashedPassword)
    .query('UPDATE Usuarios SET senha = @senha, data_atualizacao = GETDATE() WHERE usrCodigo = @usrCodigo');

  return true;
}

export async function migrarSenhasParaHash() {
  try {
    const pool = await getPool();

    // 1. Recupera todos os usuários. Adicione 'senha' no SELECT
    const result = await pool.request().query('SELECT usuario_id, senha FROM Usuarios');
    const usuariosParaAtualizar = result.recordset;

    if (usuariosParaAtualizar.length === 0) {
      console.log('Nenhum usuário encontrado para atualizar. A migração já pode ter sido feita.');
      return;
    }

    console.log(`Iniciando a migração de ${usuariosParaAtualizar.length} senhas...`);
    
    const saltRounds = 10;
    let atualizacoesRealizadas = 0;
    
    // 2. Itera sobre cada usuário, gera o hash e atualiza o banco
    for (const usuario of usuariosParaAtualizar) {
      const senhaTextoPuro = usuario.senha;

      // Verifica se a senha já é um hash para evitar processamento desnecessário
      if (senhaTextoPuro && (senhaTextoPuro.startsWith('$2b$') || senhaTextoPuro.startsWith('$2a$'))) {
        continue;
      }

      try {
        const hashedPassword = await bcrypt.hash(senhaTextoPuro, saltRounds);

        // 3. Atualiza o registro do usuário com o novo hash
        await pool.request()
          .input('usuario_id', sql.Int, usuario.usuario_id)
          .input('hashedPassword', sql.VarChar, hashedPassword)
          .query('UPDATE Usuarios SET senha = @hashedPassword WHERE usuario_id = @usuario_id');

        atualizacoesRealizadas++;
        console.log(`- Usuário ${usuario.usuario_id} atualizado com sucesso.`);
      } catch (hashError) {
        console.error(`Erro ao processar o usuário ${usuario.usuario_id}:`, hashError.message);
      }
    }
    
    console.log(`\nMigração concluída! Total de senhas atualizadas: ${atualizacoesRealizadas}.`);

  } catch (err) {
    console.error('Erro na migração:', err.message);
  }
}