import dotenv from 'dotenv';
import { getPool } from './src/db/sqlserver.js';
import fs from 'fs';

dotenv.config();

async function createUser() {
  try {
    const pool = await getPool();

    // Ler o script SQL
    const sqlScript = fs.readFileSync('./db/users_schema.sql', 'utf8');

    // Executar o script
    await pool.request().query(sqlScript);

    console.log('✅ Tabela Usuarios criada e usuário master inserido com sucesso!');
    console.log('📋 Usuário criado:');
    console.log('   Nome: master');
    console.log('   Senha: master12345');
    console.log('   Role: MASTER');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  }
}

createUser();
