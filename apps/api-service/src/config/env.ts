import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../../../.env")
});

export const env = {
  PORT: process.env.PORT
};

if (!env.PORT) {
  throw new Error("PORT is not defined in environment variables");
}