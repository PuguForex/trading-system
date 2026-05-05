import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

let secretsLoaded = false;

export function loadSecrets(context?: string) {
  if (secretsLoaded) return;

  // 🚨 Require explicit context
  if (!context) {
    throw new Error("Secrets access denied: missing context");
  }

  // Optional: restrict allowed contexts
  const allowedContexts = ["server-init"];

  if (!allowedContexts.includes(context)) {
    throw new Error(`Secrets access denied for context: ${context}`);
  }

  dotenv.config({
    path: path.resolve(__dirname, "../../../.env.secrets"),
  });

  secretsLoaded = true;
}

// Load root .env
const envName = process.env.NODE_ENV || "development";

dotenv.config({
  path: path.resolve(__dirname, `../../../.env.${envName}`),
});

// fallback
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

// Schema validation
const schema = z.object({
  PORT: z.string().min(1),
  API_URL: z.url(),
  ALLOWED_ORIGINS: z.string().min(1),
  // TODO: enforce outbound filtering middleware using this value (Phase 8 - Network Security)
  ALLOWED_OUTBOUND_HOSTS: z.string().min(1).optional(),
  API_KEY: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"), // ← ADD
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data!; // ← non-null assertion
