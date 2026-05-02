import { loadSecrets } from "config";

loadSecrets("server-init");

const apiKey = process.env.API_KEY;
console.log("API Key loaded:", !!apiKey);

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit"; // ← ADD
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
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

// Rate limiting — applied globally before all routes        // ← ADD
const limiter = rateLimit({
  // ← ADD
  windowMs: 15 * 60 * 1000, // 15 minutes                  // ← ADD
  limit: 100, // max 100 requests per window // ← ADD
  standardHeaders: "draft-8", // RateLimit headers (RFC)     // ← ADD
  legacyHeaders: false, // disable X-RateLimit-*       // ← ADD
  message: { error: "Too many requests, please try again later." }, // ← ADD
}); // ← ADD
// ← ADD
app.use(limiter); // ← ADD

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
