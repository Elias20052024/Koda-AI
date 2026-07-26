import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import passport from "passport";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session is required by passport even though we use sessionless JWT-style tokens
app.use(
  session({
    secret: process.env["SESSION_SECRET"] ?? "koda-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env["NODE_ENV"] === "production", maxAge: 60_000 },
  })
);
app.use(passport.initialize());

app.use("/api", router);

export default app;
