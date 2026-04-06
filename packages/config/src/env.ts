import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Load root .env
dotenv.config({
  path: path.resolve(__dirname, "../../../.env")
});

// Schema validation
const schema = z.object({
  PORT: z.string().min(1)
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;