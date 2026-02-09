/**
 * Verify database tables and Better Auth configuration
 * This script checks that all required tables exist and are accessible
 */

import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import { config } from "dotenv";

// Load environment variables
config();

// Configure Neon WebSocket
neonConfig.webSocketConstructor = ws;

async function verifyDatabase() {
  console.log("🔍 Verifying Better Auth database setup...\n");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("❌ DATABASE_URL environment variable is not set");
  }

  console.log("✅ DATABASE_URL found");
  console.log(`   Connection: ${databaseUrl.split("@")[1]?.split("?")[0]}\n`);

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Test connection
    console.log("Testing database connection...");
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful\n");

    // Check for required tables
    console.log("Checking required tables...");
    const requiredTables = ["user", "session", "account", "verification"];

    for (const tableName of requiredTables) {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        )`,
        [tableName]
      );

      const exists = result.rows[0]?.exists;
      if (exists) {
        console.log(`✅ Table '${tableName}' exists`);

        // Get column info
        const columns = await pool.query(
          `SELECT column_name, data_type, is_nullable
           FROM information_schema.columns
           WHERE table_name = $1
           ORDER BY ordinal_position`,
          [tableName]
        );

        console.log(`   Columns: ${columns.rows.map((c) => c.column_name).join(", ")}`);
      } else {
        console.log(`❌ Table '${tableName}' does NOT exist`);
      }
    }

    console.log("\n✅ Database verification complete!");
  } catch (error) {
    console.error("\n❌ Database verification failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyDatabase();
