import dotenv from 'dotenv';
import { getPool } from './src/db/sqlserver.js';
import bcrypt from 'bcrypt';

dotenv.config();

async function createUser() {
  try {
    const pool = await getPool();

    // Criar tabela se não existir
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Usuarios' AND xtype='U')
      CREATE TABLE Usuarios (
        -- Este script não deve mais criar a tabela, pois o schema já existe.
        -- A criação da tabela deve ser gerenciada por um script de schema principal.
        SELECT 1
      )
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_usuarios_role')
      CREATE INDEX idx_usuarios_role ON Usuarios(role)
    `);

    // Verificar se usuário master já existe
    const existingUser = await pool.request()
      .input('nome', 'master')
      .query('SELECT * FROM Usuarios WHERE nome = @nome');

    if (existingUser.recordset.length > 0) {
      console.log('✅ Usuário master já existe!');
      console.log('📋 Dados do usuário:');
      console.log('   Nome:', existingUser.recordset[0].nome);
      console.log('   Role:', existingUser.recordset[0].role);
    } else {
      // Gerar hash da senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('master12345', saltRounds);
      // Inserir usuário master
      await pool.request()
        .input('nome', 'master')
        .input('senha', hashedPassword)
        .input('role', 'MASTER')
        .query(`
          INSERT INTO Usuarios (nome, senha, role)
          VALUES (@nome, @senha, @role)
        `);

      console.log('✅ Usuário master criado com sucesso!');
      console.log('📋 Dados do usuário:');
      console.log('   Nome: master');
      console.log('   Role: MASTER');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  }
}

createUser();
