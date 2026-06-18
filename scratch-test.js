const { Pool } = require('pg');

const pooledUrl = "postgresql://neondb_owner:npg_NV7wus8IhZaO@ep-dry-butterfly-at1qf0y6-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const directUrl = "postgresql://neondb_owner:npg_NV7wus8IhZaO@ep-dry-butterfly-at1qf0y6.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function test(name, connectionString) {
  console.log(`Testing ${name}...`);
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`${name} SUCCESS:`, res.rows[0]);
  } catch (err) {
    console.error(`${name} FAILED:`, err.message);
  } finally {
    await pool.end();
  }
}

async function run() {
  await test('Pooled Link', pooledUrl);
  await test('Direct Link', directUrl);
}

run();
