import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/trading-system/" : "/",
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
}));
