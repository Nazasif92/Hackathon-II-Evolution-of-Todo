import { neonConfig, Pool } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";
import ws from "ws";
import { config } from "dotenv";

// Load environment variables from .env file
config();

// Configure Neon to use WebSocket for serverless compatibility
neonConfig.webSocketConstructor = ws;

async function runMigration() {
  console.log("Starting Better Auth database migration...");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Read the SQL migration file
    const migrationPath = join(
      process.cwd(),
      "migrations",
      "001_better_auth_schema.sql"
    );
    const sql = readFileSync(migrationPath, "utf-8");

    console.log("Applying migration...");

    // Execute the migration
    await pool.query(sql);

    console.log("✅ Migration completed successfully!");
    console.log("\nCreated tables:");
    console.log("  - user");
    console.log("  - session");
    console.log("  - account");
    console.log("  - verification");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
