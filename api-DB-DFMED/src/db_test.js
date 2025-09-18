import dotenv from 'dotenv';
import { getPool } from './db/sqlserver.js';

dotenv.config();

console.log('Using DB config from env:', {
  host: process.env.SQLSERVER_HOST,
  db: process.env.SQLSERVER_DB,
  user: process.env.SQLSERVER_USER && '***',
  port: process.env.SQLSERVER_PORT || 'default'
});

async function run() {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 AS ok');
    console.log('DB basic test result:', result.recordset);

    // Test the patient table
    const patientResult = await pool.request().query('SELECT TOP 1 pacCodigo, pacNome FROM CadPac');
    console.log('Patient table test result:', patientResult.recordset);

    console.log('DB test finished successfully');
    process.exit(0);
  } catch (err) {
    console.error('DB test error:', err && (err.message || err));
    if (err && err.code) console.error('Error code:', err.code);
    // msnodesqlv8 may wrap native errors in originalError or detail
    if (err && err.originalError) {
      console.error('Original error:');
      console.dir(err.originalError, { depth: null });
    }
    if (err && err.detail) {
      console.error('Error detail:');
      console.dir(err.detail, { depth: null });
    }
    console.error('Full error object:');
    console.dir(err, { depth: null });
    process.exit(2);
  }
}

run();
