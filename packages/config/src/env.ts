import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Load root .env
const envName = process.env.NODE_ENV || "development";

dotenv.config({
  path: path.resolve(__dirname, `../../../.env.${envName}`)
});

// fallback
dotenv.config({
  path: path.resolve(__dirname, "../../../.env")
});

// Schema validation
const schema = z.object({
  PORT: z.string().min(1),
  API_URL: z.url()
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;