const { Client } = require("pg");
require("dotenv").config();

const targetDatabase = process.env.DB_NAME_TEST || "storefront_test";

function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function ensureTestDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_ADMIN_DB || "postgres",
  });

  await client.connect();

  try {
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [targetDatabase]
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${quoteIdentifier(targetDatabase)}`);
      console.log(`Created database ${targetDatabase}`);
    }
  } finally {
    await client.end();
  }
}

ensureTestDatabase().catch((error) => {
  console.error(`Failed to ensure ${targetDatabase} exists`);
  console.error(error);
  process.exit(1);
});