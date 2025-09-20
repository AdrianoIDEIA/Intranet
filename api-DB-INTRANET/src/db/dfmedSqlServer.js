
// dotenv is already loaded in index.js

// `sql` will be set to the imported mssql module (either tedious or msnodesqlv8)
let sql = null;

// Build connection config. Support both SQL auth and Windows Integrated (msnodesqlv8).

let useWindowsAuth = (process.env.SQLSERVER_AUTH || '').toLowerCase() === 'windows';
// If user contains domain (DOMAIN\user) but password is provided, prefer SQL auth for remote connections
if (!useWindowsAuth && process.env.SQLSERVER_USER && (process.env.SQLSERVER_USER.indexOf('\\') !== -1 || process.env.SQLSERVER_USER.indexOf('/') !== -1) && !process.env.SQLSERVER_PASSWORD) {
  useWindowsAuth = true;
}

let config;
if (useWindowsAuth) {
  // Use msnodesqlv8 driver with Trusted Connection
  const host = process.env.SQLSERVER_HOST || 'localhost';
  const database = process.env.SQLSERVER_DB; // Use env database
  // Build a connectionString expected by msnodesqlv8 (include instance or port when present)
  const instanceName = process.env.SQLSERVER_INSTANCE || undefined;
  const portPart = process.env.SQLSERVER_PORT ? `,${process.env.SQLSERVER_PORT}` : '';
  const serverAddress = instanceName ? `${host}\${instanceName}` : `${host}${portPart}`;
  const connectionString = `Server=${serverAddress};Database=${database};Trusted_Connection=Yes;`;

  config = {
    server: host,
    instanceName: instanceName,
    database,
    driver: 'msnodesqlv8',
    connectionString,
    options: { trustedConnection: true, trustServerCertificate: true },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
  };
} else {
  config = {
    user: process.env.SQLSERVER_USER,
    password: process.env.SQLSERVER_PASSWORD,
    server: process.env.SQLSERVER_HOST,
    port: process.env.SQLSERVER_PORT ? Number(process.env.SQLSERVER_PORT) : undefined,
    options: { encrypt: process.env.SQLSERVER_ENCRYPT === 'true' ? true : false, trustServerCertificate: true },
    // If you need to use a named instance, set SQLSERVER_INSTANCE
    instanceName: process.env.SQLSERVER_INSTANCE || undefined,
    database: process.env.SQLSERVER_DB, // Use env database
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
  };
}

console.log('DFMed config database:', config.database);

let poolPromise;
export async function getDfmedPool() {
  if (!poolPromise) {
    if (useWindowsAuth) {
      try {
        const modRaw = await import('mssql/msnodesqlv8.js');
        const mod = modRaw && modRaw.default ? modRaw.default : modRaw;
        sql = mod;
      } catch (e) {
        const modRaw = await import('mssql/msnodesqlv8');
        const mod = modRaw && modRaw.default ? modRaw.default : modRaw;
        sql = mod;
      }

      try {
        poolPromise = await sql.connect(config);
      } catch (err) {
        console.error('msnodesqlv8 connection error:');
        try { console.dir(err, { depth: null }); } catch (e) { console.error(err); }
        throw err;
      }

    } else {
      const modRaw = await import('mssql');
      const mod = modRaw && modRaw.default ? modRaw.default : modRaw;
      sql = mod;

      try {
        poolPromise = await sql.connect(config);
      } catch (err) {
        console.error('mssql connection error:');
        try { console.dir(err, { depth: null }); } catch (e) { console.error(err); }
        throw err;
      }
    }
  }
  return poolPromise;
}

export { sql };
