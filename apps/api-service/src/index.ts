import { loadSecrets } from "config";

loadSecrets("server-init");

import pino from "pino";
import pinoHttp from "pino-http";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { Trade } from "shared-types";
import { env } from "config";
import { requireApiKey } from './middleware/auth';

const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
});

const app = express();
app.set("trust proxy", 1); // ← ADD: trust Render's load balancer
const PORT = env.PORT;

if (!PORT) {
  throw new Error("PORT is not defined in environment variables");
}

const allowedOrigins = env.ALLOWED_ORIGINS.split(",");

app.use(helmet());

app.use(
  pinoHttp({
    logger,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.headers['x-api-key']",
        "req.headers['x-auth-token']",
      ],
      censor: "[REDACTED]",
    },
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        userAgent: req.headers["user-agent"],
      }),
      res: (req) => ({
        statusCode: req.statusCode,
      }),
    },
  }),
);

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use(limiter);

app.use(requireApiKey);

const trades: Trade[] = [
  { symbol: "EURUSD", entry: 1.1, exit: 1.2, volume: 1 },
  { symbol: "GBPUSD", entry: 1.3, exit: 1.25, volume: 2 },
];

app.get("/trades", (req, res) => {
  res.json(trades);
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, "API server started");
});
