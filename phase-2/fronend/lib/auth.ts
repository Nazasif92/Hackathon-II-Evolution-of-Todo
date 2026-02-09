import { authConfig } from "@/auth.config";

// Export the auth instance from the config
export const auth = authConfig;

export type Session = typeof auth.$Infer.Session;
