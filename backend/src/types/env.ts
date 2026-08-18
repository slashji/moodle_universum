import "dotenv/config";

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  databaseUrl: requireEnv("DATABASE_URL"),

  moodleProvider: (process.env.MOODLE_PROVIDER ?? "mock") as "mock" | "real",
  moodleBaseUrl: process.env.MOODLE_BASE_URL ?? "",
  moodleToken: process.env.MOODLE_TOKEN ?? "",
  moodleTimeoutMs: Number(process.env.MOODLE_TIMEOUT_MS ?? 10000),

  authMode: (process.env.AUTH_MODE ?? "dev") as "dev",
  devDefaultRole: (process.env.DEV_DEFAULT_ROLE ?? "student") as "student" | "admin",
} as const;
