import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_l3LxB2SEHbIc@ep-green-wave-atn2naep-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testDB() {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("✅ Neon DB Connected");
    console.log(result.rows);

    await pool.end();
  } catch (error) {
    console.log("❌ Neon DB Failed");
    console.error(error);
  }
}

testDB();