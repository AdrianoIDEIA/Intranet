import dotenv from 'dotenv';
import { getPool } from './src/db/sqlserver.js';
import bcrypt from 'bcrypt';

dotenv.config();

async function createTestUser() {
  try {
    const pool = await getPool();

    // Verificar se usuário test já existe
    const existingUser = await pool.request()
      .input('nome', 'Test User')
      .query('SELECT * FROM Usuarios WHERE nome = @nome');

    if (existingUser.recordset.length > 0) {
      console.log('✅ Usuário test já existe!');
      console.log('📋 Dados do usuário:');
      console.log('   Nome:', existingUser.recordset[0].nome);
      console.log('   Role:', existingUser.recordset[0].role);
    } else {
      // Gerar hash da senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('test123', saltRounds);
      // Inserir usuário test
      await pool.request()
        .input('nome', 'Test User')
        .input('senha', hashedPassword)
        .input('role', 'TO')
        .query(`
          INSERT INTO Usuarios (nome, senha, role)
          VALUES (@nome, @senha, @role)
        `);

      console.log('✅ Usuário test criado com sucesso!');
      console.log('📋 Dados do usuário:');
      console.log('   Nome: Test User');
      console.log('   Role: TO');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  }
}

createTestUser();
