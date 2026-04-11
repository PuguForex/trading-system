import { loadSecrets } from "config";

loadSecrets("server-init");

const apiKey = process.env.API_KEY;
console.log("API Key loaded:", !!apiKey);

import express from "express";
import cors from "cors";
import { Trade } from "shared-types";
import { env } from "config";

const app = express();
const PORT = env.PORT;

if (!PORT) {
  throw new Error("PORT is not defined in environment variables");
}

const allowedOrigins = env.ALLOWED_ORIGINS.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl/postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

const trades: Trade[] = [
  { symbol: "EURUSD", entry: 1.1, exit: 1.2, volume: 1 },
  { symbol: "GBPUSD", entry: 1.3, exit: 1.25, volume: 2 },
];

app.get("/trades", (req, res) => {
  res.json(trades);
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
