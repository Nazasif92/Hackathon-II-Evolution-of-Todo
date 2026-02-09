import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

// Configure Neon for WebSocket support (required for serverless)
neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

declare global {
  var authPoolGlobal: InstanceType<typeof Pool> | undefined;
}

function getOrCreatePool() {
  if (!globalThis.authPoolGlobal) {
    globalThis.authPoolGlobal = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return globalThis.authPoolGlobal;
}

declare global {
  var betterAuthConfigGlobal: ReturnType<typeof betterAuth> | undefined;
}

function getOrCreateAuthConfig() {
  if (!globalThis.betterAuthConfigGlobal) {
    console.log("[Auth] Initializing Better Auth with Neon Serverless...");
    globalThis.betterAuthConfigGlobal = betterAuth({
      database: {
        provider: "postgres",
        pool: getOrCreatePool() as any,
      },
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        requireEmailVerification: false,
      },
      session: {
        expiresIn: 60 * 60 * 24,
        updateAge: 60 * 60,
      },
      secret: process.env.BETTER_AUTH_SECRET!,
      baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
      plugins: [
        jwt({
          expiresIn: 60 * 60 * 24,
          issuer: "better-auth",
        }),
      ],
    });
    console.log("[Auth] Better Auth initialized successfully");
  }
  return globalThis.betterAuthConfigGlobal;
}

export const authConfig = getOrCreateAuthConfig();
